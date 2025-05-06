import { Elysia } from 'elysia';

import type { Redis } from '#/core/store/redis';
import { CoreError } from '#/error/coreError';
import { ELYSIA_KEY_ERROR } from '#/error/key/elysiaKeyError';
import { HTTP_STATUS_CODE } from '#/types/enum/httpStatusCode';

/**
 * Options to configure the rate limit plugin.
 *
 * This interface defines the configuration parameters required for setting up
 * rate limiting behavior, including Redis storage, limits, time windows, and
 * customizable error messages.
 *
 * ### Key Configuration Areas:
 * - Redis connection for distributed rate limit tracking
 * - Request limits and time windows
 * - Custom error messaging
 *
 * @example
 * ```typescript
 * const options: RateLimitOptions = {
 *   redis: redisInstance, // Your Redis instance
 *   limit: 100,          // Allow 100 requests
 *   window: 60,          // Per 60 seconds
 *   message: 'You have exceeded the rate limit. Please try again later.'
 * };
 * ```
 */
export interface RateLimitOptions {
    /**
     * The Redis instance to store rate limit data.
     *
     * Using Redis enables distributed rate limiting across multiple server instances,
     * ensuring consistent rate limit enforcement in scaled environments.
     */
    redis: Redis;

    /**
     * Maximum number of requests allowed in the time window.
     *
     * This defines how many requests a client can make within the specified time window
     * before rate limiting is applied.
     */
    limit: number;

    /**
     * Time window in seconds during which the request limit applies.
     *
     * This defines the duration of the rate limiting window. For example, a window of 60
     * with a limit of 100 allows 100 requests per minute per client.
     */
    window: number;

    /**
     * Custom error message when rate limit is exceeded.
     *
     * If provided, this message will be included in the error response when a client
     * exceeds their rate limit. If not provided, a default message is used.
     *
     * @defaultValue 'Rate limit exceeded'
     */
    message?: string;
}

/**
 * The `rateLimitPlugin` provides rate limiting capabilities for Elysia applications,
 * protecting APIs from excessive use and potential abuse. It tracks request rates by client IP
 * and enforces configurable limits based on a sliding time window.
 *
 * The plugin uses Redis for tracking request counts, making it suitable for distributed
 * environments where multiple server instances may be handling requests from the same client.
 * When a client exceeds the configured request limit, the plugin returns a 429 Too Many Requests
 * response with appropriate headers indicating the limit and reset time.
 *
 * ### Key Features:
 * - IP-based rate limiting
 * - Configurable request limits and time windows
 * - Redis-backed request counting for distributed environments
 * - Standard rate limit HTTP headers (X-RateLimit-*)
 * - Customizable error messaging
 * - Support for proxies with X-Forwarded-For header handling
 *
 * ### Rate Limit Headers:
 * The plugin adds the following headers to all responses:
 * - `X-RateLimit-Limit`: The maximum number of requests allowed in the window
 * - `X-RateLimit-Remaining`: The number of requests remaining in the current window
 * - `X-RateLimit-Reset`: The time in seconds until the rate limit resets
 *
 * @param options - The configuration options for the rate limit plugin
 *
 * @returns An Elysia plugin that adds rate limiting functionality
 *
 * @example
 * ```typescript
 * import { Elysia } from 'elysia';
 * import { Redis } from '#/core/store/redis';
 * import { rateLimitPlugin } from '#/core/elysia/plugin/ratelimit';
 *
 * // Create Redis instance
 * const redis = new Redis({
 *   host: 'localhost',
 *   port: 6379
 * });
 * await redis.connect();
 *
 * // Create and configure the application with rate limiting
 * const app = new Elysia()
 *   .use(rateLimitPlugin({
 *     redis,
 *     limit: 100,           // 100 requests
 *     window: 60,           // per minute
 *     message: 'Too many requests, please try again later.'
 *   }))
 *   .get('/public-api', () => {
 *     return { success: true, message: 'This endpoint is rate limited' };
 *   });
 *
 * // Start the server
 * app.listen(3000);
 * ```
 */
export const rateLimitPlugin = ({ redis, limit, window, message }: RateLimitOptions) => new Elysia({
    name: 'rateLimitPlugin',
    seed: {
        redis,
        limit,
        window,
        message
    }
})
    .onRequest(async ({ set, request }) => {
        const ip = request.headers.get('x-forwarded-for')
            || request.headers.get('x-real-ip')
            || '127.0.0.1';

        const key = `ratelimit:${ip}`;

        const current = await redis.client.get(key);
        const count = current ? parseInt(current) : 0;

        if (count === 0)
            await redis.client.setex(key, window, '1');
        else
            await redis.client.incr(key);

        const newCount = await redis.client.get(key);
        const currentCount = newCount ? parseInt(newCount) : 0;

        if (currentCount > limit) {
            set.status = HTTP_STATUS_CODE.TOO_MANY_REQUESTS;
            throw new CoreError({
                key: ELYSIA_KEY_ERROR.RATE_LIMIT_EXCEEDED,
                message: message || 'Rate limit exceeded',
                httpStatusCode: HTTP_STATUS_CODE.TOO_MANY_REQUESTS,
                cause: {
                    limit,
                    window,
                    remaining: 0,
                    reset: await redis.client.ttl(key)
                }
            });
        }

        set.headers = {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': Math.max(0, limit - currentCount).toString(),
            'X-RateLimit-Reset': (await redis.client.ttl(key)).toString()
        };
    })
    .as('scoped');
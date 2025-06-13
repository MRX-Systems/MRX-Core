import { Elysia } from 'elysia';

import { CoreError } from '#/error/coreError';
import { errorKeys } from './enums/errorKeys';
import type { RateLimitOptions } from './types/rateLimitOptions';

/**
 * The `rateLimitPlugin` provides rate limiting capabilities for Elysia applications,
 * protecting APIs from excessive use and potential abuse. It tracks request rates by client IP
 * and enforces configurable limits based on a sliding time window.
 *
 * ### Rate Limit Headers:
 * The plugin adds the following headers to all responses:
 * - `X-RateLimit-Limit`: The maximum number of requests allowed in the window
 * - `X-RateLimit-Remaining`: The number of requests remaining in the current window
 * - `X-RateLimit-Reset`: The time in seconds until the rate limit resets
 *
 * @param options - The configuration options for the rate limit plugin
 *
 * @returns An {@link Elysia} plugin that adds rate limiting functionality
 *
 * @example
 * ```ts
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
    .onRequest(async ({ set, request, server }) => {
        const ip = request.headers.get('x-forwarded-for')
            || request.headers.get('x-real-ip')
            || server?.requestIP(request)?.address // get IP from socket directly
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
            set.status = 429;
            throw new CoreError({
                key: errorKeys.rateLimitExceeded,
                message: message || 'Rate limit exceeded',
                httpStatusCode: 429,
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
import { Elysia } from 'elysia';
import type { Redis } from '#/core/store/redis';
import { CoreError } from '#/error/coreError';
import { HTTP_STATUS_CODE } from '#/types/enum/httpStatusCode';

interface RateLimitOptions {
    /**
     * The Redis instance to store rate limit data
     */
    redis: Redis;
    /**
     * Maximum number of requests allowed in the window
     */
    limit: number;
    /**
     * Time window in seconds
     */
    window: number;
    /**
     * Custom error message when rate limit is exceeded
     */
    message?: string;
}

export const rateLimitPlugin = ({ redis, limit, window, message }: RateLimitOptions): Elysia => new Elysia({
    name: 'rateLimitPlugin'
})
    .onRequest(async ({ request }) => {
        const ip = request.headers.get('x-forwarded-for')
            || request.headers.get('x-real-ip')
            || '127.0.0.1';

        const key = `ratelimit:${ip}`;

        // Get current count for this IP
        const current = await redis.client.get(key);
        const count = current ? parseInt(current) : 0;

        if (count >= limit)
            throw new CoreError({
                key: 'core.error.rate_limit_exceeded',
                message: message || 'Rate limit exceeded',
                httpStatusCode: HTTP_STATUS_CODE.TOO_MANY_REQUESTS,
                cause: {
                    limit,
                    window,
                    remaining: 0,
                    reset: await redis.client.ttl(key)
                }
            });


        if (count === 0)
            await redis.client.setex(key, window, '1');
        else
            await redis.client.incr(key);


        request.headers.set('X-RateLimit-Limit', limit.toString());
        request.headers.set('X-RateLimit-Remaining', (limit - count - 1).toString());
        request.headers.set('X-RateLimit-Reset', (await redis.client.ttl(key)).toString());
    });
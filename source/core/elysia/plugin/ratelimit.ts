import { Elysia } from 'elysia';

import type { Redis } from '#/core/store/redis';
import { CoreError } from '#/error/coreError';
import { ELYSIA_KEY_ERROR } from '#/error/key';
import { HTTP_STATUS_CODE } from '#/types/enum/httpStatusCode';

export interface RateLimitOptions {
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
    });
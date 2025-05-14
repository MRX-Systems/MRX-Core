import { Elysia } from 'elysia';

import { CoreError } from '#/error/coreError';
import { elysiaKeyError } from './enums/elysiaKeyError';
import { httpStatusCode } from './enums/httpStatusCode';
import type { RateLimitOptions } from './types/rateLimitOptions';

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
            set.status = httpStatusCode.tooManyRequests;
            throw new CoreError({
                key: elysiaKeyError.rateLimitExceeded,
                message: message || 'Rate limit exceeded',
                httpStatusCode: httpStatusCode.tooManyRequests,
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
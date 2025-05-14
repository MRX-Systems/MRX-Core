import { afterEach, describe, expect, test } from 'bun:test';
import { Elysia } from 'elysia';

import { rateLimitPlugin } from '#/elysia/ratelimit';
import { Redis } from '#/store/redis';

describe('Rate Limit Plugin', () => {
    const redis = new Redis({
        host: process.env.STORE_HOST ?? '',
        password: process.env.STORE_KEY ?? '',
        port: parseInt(process.env.STORE_PORT ?? ''),
        tls: {}
    });

    afterEach(async () => {
        const keys = await redis.client.keys('ratelimit:*');
        if (keys.length > 0)
            await redis.client.del(...keys);
    });

    const app = new Elysia()
        .use(rateLimitPlugin({
            redis,
            limit: 5, // 5 requests
            window: 60, // per minute
            message: 'Too many requests, please try again later'
        }))
        .get('/', () => 'Hello World!');

    test('should allow requests within rate limit', async () => {
        const ip = '127.0.0.12';

        // Send 5 requests (within limit)
        for (let i = 0; i < 5; i++) {
            const response = await app.handle(
                new Request('http://localhost/', {
                    headers: { 'x-forwarded-for': ip }
                })
            );

            expect(response.status).toEqual(200);
            const text = await response.text();
            expect(text).toEqual('Hello World!');

            // Check rate limit headers
            const remaining = response.headers.get('X-RateLimit-Remaining');
            const limit = response.headers.get('X-RateLimit-Limit');

            expect(remaining).toBeDefined();
            expect(parseInt(remaining || '0')).toEqual(4 - i);
            expect(limit).toEqual('5');
        }
    });

    test('should block requests exceeding rate limit', async () => {
        const ip = '127.0.0.12';

        for (let i = 0; i < 5; i++)
            await app.handle(
                new Request('http://localhost/', {
                    headers: { 'x-forwarded-for': ip }
                })
            );

        await Bun.sleep(100);

        const blockedResponse = await app.handle(
            new Request('http://localhost/', {
                headers: { 'x-forwarded-for': ip }
            })
        );

        expect(blockedResponse.status).toBe(429);
        const errorText = await blockedResponse.text();
        expect(errorText).toEqual('Too many requests, please try again later');
    });

    test('should reset rate limit after window period', async () => {
        const ip = '1.2.3.4';

        const response = await app.handle(new Request('http://localhost/', {
            headers: { 'x-forwarded-for': ip }
        }));

        expect(response.status).toEqual(200);
        const resetTime = parseInt(response.headers.get('X-RateLimit-Reset') || '0');
        expect(resetTime).toBeLessThanOrEqual(60);
    });
});
import { rateLimitPlugin } from '#/core/elysia/plugin/ratelimit';
import { Redis } from '#/core/store/redis';
import { afterEach, describe, expect, test } from 'bun:test';
import { Elysia } from 'elysia';

describe('Rate Limit Plugin', () => {
    const redis = new Redis({
        host: 'localhost',
        port: 6379
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
            message: 'Trop de requêtes, veuillez réessayer plus tard'
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

        await new Promise((resolve) => setTimeout(resolve, 100));

        const blockedResponse = await app.handle(
            new Request('http://localhost/', {
                headers: { 'x-forwarded-for': ip }
            })
        );

        expect(blockedResponse.status).toBe(429);
        const errorText = await blockedResponse.text();
        expect(errorText).toEqual('Trop de requêtes, veuillez réessayer plus tard');
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
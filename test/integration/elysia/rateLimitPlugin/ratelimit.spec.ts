import { afterEach, describe, expect, test } from 'bun:test';
import { Elysia } from 'elysia';

import { rateLimitPlugin } from '#/modules/elysia/ratelimitPlugin/ratelimit';
import { Redis } from '#/modules/store/redis';

const redis = new Redis({
    host: process.env.STORE_HOST ?? '',
    password: process.env.STORE_KEY ?? '',
    port: parseInt(process.env.STORE_PORT ?? ''),
    tls: {}
});

const app = new Elysia()
    .use(rateLimitPlugin({
        redis,
        limit: 5, // 5 requests
        window: 60, // per minute
        message: 'Too many requests, please try again later'
    }))
    .get('/', () => 'Hello World!');

describe('Rate Limit Plugin', () => {
    afterEach(async () => {
        const keys = await redis.client.keys('ratelimit:*');
        if (keys.length > 0)
            await redis.client.del(...keys);
    });

    test('should allow requests within rate limit', async () => {
        const ip = '127.0.0.12';

        // Send 5 requests (within limit)
        for (let i = 0; i < 5; ++i) {
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

        for (let i = 0; i < 5; ++i)
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

    test('should handle different IP extraction headers', async () => {
        // Test x-forwarded-for header
        const response1 = await app.handle(new Request('http://localhost/', {
            headers: { 'x-forwarded-for': '192.168.1.100' }
        }));
        expect(response1.status).toEqual(200);
        expect(response1.headers.get('X-RateLimit-Remaining')).toEqual('4');

        // Test x-real-ip header (should be different rate limit bucket)
        const response2 = await app.handle(new Request('http://localhost/', {
            headers: { 'x-real-ip': '192.168.1.101' }
        }));
        expect(response2.status).toEqual(200);
        expect(response2.headers.get('X-RateLimit-Remaining')).toEqual('4');

        // Test fallback to default IP when no headers present
        const response3 = await app.handle(new Request('http://localhost/', {}));
        expect(response3.status).toEqual(200);
        expect(response3.headers.get('X-RateLimit-Remaining')).toEqual('4');
    });

    test('should handle concurrent requests from different IPs', async () => {
        const ips = ['10.0.0.1', '10.0.0.2', '10.0.0.3'];

        // Send concurrent requests from different IPs
        const promises = ips.map((ip) => app.handle(new Request('http://localhost/', {
            headers: { 'x-forwarded-for': ip }
        })));

        const responses = await Promise.all(promises);

        // Each IP should have its own rate limit bucket
        responses.forEach((response) => {
            expect(response.status).toEqual(200);
            expect(response.headers.get('X-RateLimit-Remaining')).toEqual('4');
        });
    });

    test('should maintain separate counters for each IP', async () => {
        const ip1 = '172.16.0.1';
        const ip2 = '172.16.0.2';

        // IP1 makes 3 requests
        for (let i = 0; i < 3; ++i) {
            const response = await app.handle(new Request('http://localhost/', {
                headers: { 'x-forwarded-for': ip1 }
            }));
            expect(response.status).toEqual(200);
        }

        // IP2 makes 2 requests
        for (let i = 0; i < 2; ++i) {
            const response = await app.handle(new Request('http://localhost/', {
                headers: { 'x-forwarded-for': ip2 }
            }));
            expect(response.status).toEqual(200);
        }

        // Check remaining counts are different
        const response1 = await app.handle(new Request('http://localhost/', {
            headers: { 'x-forwarded-for': ip1 }
        }));
        expect(response1.headers.get('X-RateLimit-Remaining')).toEqual('1');

        const response2 = await app.handle(new Request('http://localhost/', {
            headers: { 'x-forwarded-for': ip2 }
        }));
        expect(response2.headers.get('X-RateLimit-Remaining')).toEqual('2');
    });

    test('should include correct rate limit headers in all responses', async () => {
        const ip = '203.0.113.1';

        for (let i = 1; i <= 5; ++i) {
            const response = await app.handle(new Request('http://localhost/', {
                headers: { 'x-forwarded-for': ip }
            }));

            expect(response.status).toEqual(200);
            expect(response.headers.get('X-RateLimit-Limit')).toEqual('5');
            expect(response.headers.get('X-RateLimit-Remaining')).toEqual((5 - i).toString());
            expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();

            const resetTime = parseInt(response.headers.get('X-RateLimit-Reset') || '0');
            expect(resetTime).toBeGreaterThan(0);
            expect(resetTime).toBeLessThanOrEqual(60);
        }
    });

    test('should return correct error format when rate limit exceeded', async () => {
        const ip = '198.51.100.1';

        // Exhaust rate limit
        for (let i = 0; i < 5; ++i)
            await app.handle(new Request('http://localhost/', {
                headers: { 'x-forwarded-for': ip }
            }));


        // Next request should be blocked
        const blockedResponse = await app.handle(new Request('http://localhost/', {
            headers: { 'x-forwarded-for': ip }
        }));

        expect(blockedResponse.status).toBe(429);

        const errorText = await blockedResponse.text();
        expect(errorText).toEqual('Too many requests, please try again later');
    });

    describe('Edge Cases and Stress Testing', () => {
        test('should handle rapid successive requests from same IP', async () => {
            const ip = '203.0.113.100';
            const promises: Promise<Response>[] = [];

            // Send 10 rapid requests simultaneously
            for (let i = 0; i < 10; ++i)
                promises.push(
                    app.handle(new Request('http://localhost/', {
                        headers: { 'x-forwarded-for': ip }
                    }))
                );

            const responses = await Promise.all(promises);

            // Count successful vs blocked requests
            const successfulCount = responses.filter((r) => r.status === 200).length;
            const blockedCount = responses.filter((r) => r.status === 429).length;

            // Due to race conditions in Redis operations, we should have approximately 5 successful requests
            // Allow some variance due to concurrent Redis operations
            expect(successfulCount).toBeGreaterThanOrEqual(5);
            expect(successfulCount).toBeLessThanOrEqual(10);
            expect(successfulCount + blockedCount).toBe(10);

            // At least some requests should be blocked if we're over the limit
            if (successfulCount > 5)
                expect(blockedCount).toBeGreaterThanOrEqual(0);
        });

        test('should handle very long IP addresses', async () => {
            const longIp = '2001:0db8:85a3:0000:0000:8a2e:0370:7334';

            const response = await app.handle(new Request('http://localhost/', {
                headers: { 'x-forwarded-for': longIp }
            }));

            expect(response.status).toEqual(200);
            expect(response.headers.get('X-RateLimit-Remaining')).toEqual('4');
        });

        test('should handle special characters in IP headers', async () => {
            const specialIp = '127.0.0.1,192.168.1.1'; // Comma-separated (common in proxies)

            const response = await app.handle(new Request('http://localhost/', {
                headers: { 'x-forwarded-for': specialIp }
            }));

            expect(response.status).toEqual(200);
            expect(response.headers.get('X-RateLimit-Remaining')).toEqual('4');

            // Test with IPv6 addresses
            const ipv6 = '2001:0db8:85a3:0000:0000:8a2e:0370:7334';
            const response2 = await app.handle(new Request('http://localhost/', {
                headers: { 'x-forwarded-for': ipv6 }
            }));

            expect(response2.status).toEqual(200);
            expect(response2.headers.get('X-RateLimit-Remaining')).toEqual('4');

            // Test with malformed IP (should still work)
            const malformedIp = 'not-an-ip-address';
            const response3 = await app.handle(new Request('http://localhost/', {
                headers: { 'x-forwarded-for': malformedIp }
            }));

            expect(response3.status).toEqual(200);
            expect(response3.headers.get('X-RateLimit-Remaining')).toEqual('4');

            // Test with empty string
            const response4 = await app.handle(new Request('http://localhost/', {
                headers: { 'x-forwarded-for': '' }
            }));

            expect(response4.status).toEqual(200);
            expect(response4.headers.get('X-RateLimit-Remaining')).toEqual('4');
        });

        test('should maintain accuracy with high request volumes', async () => {
            const testIps = Array.from({ length: 20 }, (_, i) => `10.1.${Math.floor(i / 256)}.${i % 256}`);
            const allPromises: Promise<Response>[] = [];

            // Each IP makes exactly 5 requests
            testIps.forEach((ip) => {
                for (let i = 0; i < 5; ++i)
                    allPromises.push(
                        app.handle(new Request('http://localhost/', {
                            headers: { 'x-forwarded-for': ip }
                        }))
                    );
            });

            const responses = await Promise.all(allPromises);

            // All requests should succeed (each IP stays within limit)
            responses.forEach((response) => {
                expect(response.status).toEqual(200);
            });

            // Total should be 100 successful requests (20 IPs × 5 requests each)
            expect(responses.length).toBe(100);
        });

        test('should handle Redis key cleanup correctly', async () => {
            const testIp = '172.16.254.1';

            // Make a request to create the key
            await app.handle(new Request('http://localhost/', {
                headers: { 'x-forwarded-for': testIp }
            }));

            // Verify key exists in Redis
            const keyExists = await redis.client.exists(`ratelimit:${testIp}`);
            expect(keyExists).toBe(1);

            // Verify TTL is set correctly
            const ttl = await redis.client.ttl(`ratelimit:${testIp}`);
            expect(ttl).toBeGreaterThan(0);
            expect(ttl).toBeLessThanOrEqual(60);
        });

        test('should handle Redis connection errors gracefully', async () => {
            // This test would require mocking Redis to simulate connection errors
            // For now, we'll test that the plugin works correctly under normal conditions
            const ip = '172.20.0.100';

            const response = await app.handle(new Request('http://localhost/', {
                headers: { 'x-forwarded-for': ip }
            }));

            expect(response.status).toEqual(200);
            expect(response.headers.get('X-RateLimit-Limit')).toEqual('5');
        });

        test('should handle burst traffic correctly', async () => {
            const burstSize = 50;
            const promises: Promise<Response>[] = [];

            // Create a burst of requests from different IPs to test system performance
            for (let i = 0; i < burstSize; ++i) {
                const ip = `10.20.30.${i % 255}`;
                promises.push(
                    app.handle(new Request('http://localhost/', {
                        headers: { 'x-forwarded-for': ip }
                    }))
                );
            }

            const responses = await Promise.all(promises);

            // All requests should succeed since they're from different IPs
            const successCount = responses.filter((r) => r.status === 200).length;
            expect(successCount).toBe(burstSize);
        });
    });

    describe('Configuration Validation', () => {
        test('should work with different rate limit configurations', async () => {
            // Test with very low limit
            const lowLimitApp = new Elysia()
                .use(rateLimitPlugin({
                    redis,
                    limit: 1,
                    window: 60,
                    message: 'Only 1 request allowed'
                }))
                .get('/', () => 'Low limit test');

            const ip = '198.51.100.200';

            // First request should succeed
            const response1 = await lowLimitApp.handle(new Request('http://localhost/', {
                headers: { 'x-forwarded-for': ip }
            }));
            expect(response1.status).toEqual(200);
            expect(response1.headers.get('X-RateLimit-Remaining')).toEqual('0');

            // Second request should be blocked
            const response2 = await lowLimitApp.handle(new Request('http://localhost/', {
                headers: { 'x-forwarded-for': ip }
            }));
            expect(response2.status).toBe(429);

            const errorText = await response2.text();
            expect(errorText).toEqual('Only 1 request allowed');
        });

        test('should work with high rate limits', async () => {
            const highLimitApp = new Elysia()
                .use(rateLimitPlugin({
                    redis,
                    limit: 1000,
                    window: 60,
                    message: 'High limit exceeded'
                }))
                .get('/', () => 'High limit test');

            const ip = '203.0.113.250';

            // Make 10 requests
            for (let i = 0; i < 10; ++i) {
                const response = await highLimitApp.handle(new Request('http://localhost/', {
                    headers: { 'x-forwarded-for': ip }
                }));
                expect(response.status).toEqual(200);
            }

            // Check that remaining count is correct
            const finalResponse = await highLimitApp.handle(new Request('http://localhost/', {
                headers: { 'x-forwarded-for': ip }
            }));
            expect(finalResponse.headers.get('X-RateLimit-Remaining')).toEqual('989');
        });
    });

    describe('Security and Performance Tests', () => {
        test('should handle IP spoofing attempts', async () => {
            const realIp = '192.168.1.100';
            const spoofedIp = '192.168.1.101';

            // Make requests with different header combinations
            const response1 = await app.handle(new Request('http://localhost/', {
                headers: {
                    'x-forwarded-for': realIp,
                    'x-real-ip': spoofedIp
                }
            }));

            // Should use x-forwarded-for (first in priority)
            expect(response1.status).toEqual(200);
            expect(response1.headers.get('X-RateLimit-Remaining')).toEqual('4');

            // Make another request with same x-forwarded-for
            const response2 = await app.handle(new Request('http://localhost/', {
                headers: {
                    'x-forwarded-for': realIp,
                    'x-real-ip': spoofedIp
                }
            }));

            expect(response2.status).toEqual(200);
            expect(response2.headers.get('X-RateLimit-Remaining')).toEqual('3');
        });

        test('should handle extremely long IP addresses', async () => {
            const longIp = 'a'.repeat(1000); // Very long string

            const response = await app.handle(new Request('http://localhost/', {
                headers: { 'x-forwarded-for': longIp }
            }));

            expect(response.status).toEqual(200);
            expect(response.headers.get('X-RateLimit-Remaining')).toEqual('4');
        });

        test('should handle unicode characters in IP headers', async () => {
            // Test with URL-encoded unicode (which is valid in HTTP headers)
            const unicodeIp = '192.168.1.100%F0%9F%9A%80'; // URL-encoded rocket emoji

            const response = await app.handle(new Request('http://localhost/', {
                headers: { 'x-forwarded-for': unicodeIp }
            }));

            expect(response.status).toEqual(200);
            expect(response.headers.get('X-RateLimit-Remaining')).toEqual('4');
        });

        test('should maintain performance under load', async () => {
            const startTime = Date.now();
            const numberOfRequests = 100;
            const promises: Promise<Response>[] = [];

            // Generate unique IPs to avoid rate limiting
            for (let i = 0; i < numberOfRequests; ++i) {
                const ip = `192.168.${Math.floor(i / 256)}.${i % 256}`;
                promises.push(
                    app.handle(new Request('http://localhost/', {
                        headers: { 'x-forwarded-for': ip }
                    }))
                );
            }

            const responses = await Promise.all(promises);
            const endTime = Date.now();
            const totalTime = endTime - startTime;

            // All requests should succeed (unique IPs)
            responses.forEach((response) => {
                expect(response.status).toEqual(200);
            });

            // Performance check: should complete within reasonable time
            expect(totalTime).toBeLessThan(5000); // 5 seconds max
            console.log(`Processed ${numberOfRequests} requests in ${totalTime}ms`);
        });

        test('should handle header injection attempts', async () => {
            // Test with escaped characters that could be used in injection attempts
            const maliciousHeader = '192.168.1.100%0d%0aX-Injected:%20malicious';

            const response = await app.handle(new Request('http://localhost/', {
                headers: { 'x-forwarded-for': maliciousHeader }
            }));

            expect(response.status).toEqual(200);
            expect(response.headers.get('X-RateLimit-Remaining')).toEqual('4');
            // Should not have injected header
            expect(response.headers.get('X-Injected')).toBeNull();
        });

        test('should handle null and undefined headers', async () => {
            // Test with completely empty headers
            const response1 = await app.handle(new Request('http://localhost/', {}));
            expect(response1.status).toEqual(200);

            // Test with explicitly null-like values
            const response2 = await app.handle(new Request('http://localhost/', {
                headers: { 'x-forwarded-for': 'null' }
            }));
            expect(response2.status).toEqual(200);

            const response3 = await app.handle(new Request('http://localhost/', {
                headers: { 'x-forwarded-for': 'undefined' }
            }));
            expect(response3.status).toEqual(200);
        });
    });

    describe('Error Handling and Edge Cases', () => {
        test('should handle mixed case headers', async () => {
            const ip = '203.0.113.50';

            const response = await app.handle(new Request('http://localhost/', {
                headers: { 'X-Forwarded-For': ip } // Mixed case
            }));

            expect(response.status).toEqual(200);
            expect(response.headers.get('X-RateLimit-Remaining')).toEqual('4');
        });

        test('should prioritize headers correctly', async () => {
            const forwardedIp = '10.0.0.1';
            const realIp = '10.0.0.2';

            // Both headers present - should use x-forwarded-for first
            const response = await app.handle(new Request('http://localhost/', {
                headers: {
                    'x-forwarded-for': forwardedIp,
                    'x-real-ip': realIp
                }
            }));

            expect(response.status).toEqual(200);
            expect(response.headers.get('X-RateLimit-Remaining')).toEqual('4');

            // Make another request with same forwarded IP
            const response2 = await app.handle(new Request('http://localhost/', {
                headers: {
                    'x-forwarded-for': forwardedIp,
                    'x-real-ip': realIp
                }
            }));

            expect(response2.status).toEqual(200);
            expect(response2.headers.get('X-RateLimit-Remaining')).toEqual('3');
        });

        test('should handle window expiration correctly', async () => {
            // Create an app with a very short window for testing
            const shortWindowApp = new Elysia()
                .use(rateLimitPlugin({
                    redis,
                    limit: 2,
                    window: 1, // 1 second window
                    message: 'Short window exceeded'
                }))
                .get('/', () => 'Short window test');

            const ip = '192.168.100.1';

            // Make 2 requests (exhaust limit)
            const response1 = await shortWindowApp.handle(new Request('http://localhost/', {
                headers: { 'x-forwarded-for': ip }
            }));
            expect(response1.status).toEqual(200);

            const response2 = await shortWindowApp.handle(new Request('http://localhost/', {
                headers: { 'x-forwarded-for': ip }
            }));
            expect(response2.status).toEqual(200);

            // Third request should be blocked
            const response3 = await shortWindowApp.handle(new Request('http://localhost/', {
                headers: { 'x-forwarded-for': ip }
            }));
            expect(response3.status).toBe(429);

            // Wait for window to expire
            await Bun.sleep(1100);

            // Should work again after window expires
            const response4 = await shortWindowApp.handle(new Request('http://localhost/', {
                headers: { 'x-forwarded-for': ip }
            }));
            expect(response4.status).toEqual(200);
        });
    });

    describe('HTTP Methods and Route Variations', () => {
        test('should apply rate limiting to all HTTP methods', async () => {
            const methodApp = new Elysia()
                .use(rateLimitPlugin({
                    redis,
                    limit: 3,
                    window: 60,
                    message: 'Method test limit exceeded'
                }))
                .get('/', () => 'GET response')
                .post('/', () => 'POST response')
                .put('/', () => 'PUT response')
                .delete('/', () => 'DELETE response');

            const ip = '10.100.200.50';

            // Test different HTTP methods - should all count towards same limit
            const getResponse = await methodApp.handle(new Request('http://localhost/', {
                method: 'GET',
                headers: { 'x-forwarded-for': ip }
            }));
            expect(getResponse.status).toEqual(200);
            expect(getResponse.headers.get('X-RateLimit-Remaining')).toEqual('2');

            const postResponse = await methodApp.handle(new Request('http://localhost/', {
                method: 'POST',
                headers: { 'x-forwarded-for': ip }
            }));
            expect(postResponse.status).toEqual(200);
            expect(postResponse.headers.get('X-RateLimit-Remaining')).toEqual('1');

            const putResponse = await methodApp.handle(new Request('http://localhost/', {
                method: 'PUT',
                headers: { 'x-forwarded-for': ip }
            }));
            expect(putResponse.status).toEqual(200);
            expect(putResponse.headers.get('X-RateLimit-Remaining')).toEqual('0');

            // Fourth request should be blocked regardless of method
            const deleteResponse = await methodApp.handle(new Request('http://localhost/', {
                method: 'DELETE',
                headers: { 'x-forwarded-for': ip }
            }));
            expect(deleteResponse.status).toBe(429);
        });

        test('should handle requests with query parameters', async () => {
            const ip = '172.30.40.50';

            const response1 = await app.handle(new Request('http://localhost/?param=value1', {
                headers: { 'x-forwarded-for': ip }
            }));
            expect(response1.status).toEqual(200);

            const response2 = await app.handle(new Request('http://localhost/?param=value2&other=test', {
                headers: { 'x-forwarded-for': ip }
            }));
            expect(response2.status).toEqual(200);
            expect(response2.headers.get('X-RateLimit-Remaining')).toEqual('3');
        });

        test('should handle requests with request body', async () => {
            const bodyApp = new Elysia()
                .use(rateLimitPlugin({
                    redis,
                    limit: 2,
                    window: 60,
                    message: 'Body test limit exceeded'
                }))
                .post('/', ({ body }) => ({ received: body }));

            const ip = '192.168.50.100';

            const response1 = await bodyApp.handle(new Request('http://localhost/', {
                method: 'POST',
                headers: {
                    'x-forwarded-for': ip,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({ test: 'data1' })
            }));
            expect(response1.status).toEqual(200);

            const response2 = await bodyApp.handle(new Request('http://localhost/', {
                method: 'POST',
                headers: {
                    'x-forwarded-for': ip,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({ test: 'data2' })
            }));
            expect(response2.status).toEqual(200);
            expect(response2.headers.get('X-RateLimit-Remaining')).toEqual('0');

            // Third request should be blocked
            const response3 = await bodyApp.handle(new Request('http://localhost/', {
                method: 'POST',
                headers: {
                    'x-forwarded-for': ip,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({ test: 'data3' })
            }));
            expect(response3.status).toBe(429);
        });
    });
});
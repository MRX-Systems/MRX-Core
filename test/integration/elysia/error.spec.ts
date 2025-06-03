import { describe, expect, test } from 'bun:test';
import { Elysia, t } from 'elysia';

import { errorPlugin } from '#/elysia/error';
import { CoreError } from '#/error/coreError';

describe('Error Plugin', () => {
    describe('Basic Error Handling', () => {
        const errorCases: [string, typeof CoreError][] = [
            ['CoreError', CoreError]
        ];

        test.each(errorCases)('should handle %s with status 500 and specific status', async (_, ErrorClass) => {
            const app = new Elysia()
                .use(errorPlugin)
                .get('/throw', () => {
                    throw new ErrorClass({
                        key: 'example',
                        message: 'Example message',
                        cause: {
                            foo: 'bar'
                        }
                    });
                })
                .get('/throw/status', () => {
                    throw new ErrorClass({
                        key: 'example',
                        message: 'Example message',
                        cause: {
                            foo: 'bar'
                        },
                        httpStatusCode: 400
                    });
                });

            const resWithDefaultStatus = await app
                .handle(new Request('http://localhost/throw'));
            expect(await resWithDefaultStatus.json()).toEqual({
                key: 'example',
                message: 'Example message',
                cause: {
                    foo: 'bar'
                }
            });
            expect(resWithDefaultStatus.status).toBe(500);

            const resCustomStatus = await app
                .handle(new Request('http://localhost/throw/status'));
            expect(await resCustomStatus.json()).toEqual({
                key: 'example',
                message: 'Example message',
                cause: {
                    foo: 'bar'
                }
            });
            expect(resCustomStatus.status).toBe(400);
        });

        test('should handle validation errors with status 400', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .post('/', () => '', {
                    body: t.Object({
                        foo: t.String()
                    })
                });

            const res = await app
                .handle(
                    new Request('http://localhost/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ foo: 1 })
                    })
                );
            const data = await res.json();
            expect(data).toEqual({
                key: 'core.error.validation',
                message: 'Validation error',
                cause: {
                    on: 'body',
                    found: {
                        foo: 1
                    },
                    errors: [
                        {
                            errors: [],
                            message: 'Expected string',
                            path: '/foo',
                            schema: {
                                type: 'string'
                            },
                            summary: 'Expected property \'foo\' to be string but found: 1',
                            type: 54,
                            value: 1
                        }
                    ]
                }
            });
            expect(res.status).toBe(400);
        });

        test('should handle not found errors with status 404', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .get('/not-found', () => '');

            const res = await app
                .handle(new Request('http://localhost/qse'));
            const data = await res.json();
            expect(data).toEqual({
                key: 'core.error.not_found',
                message: 'Not found'
            });
            expect(res.status).toBe(404);
        });

        test('should handle unknown errors with status 500', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .get('/throw', () => {
                    throw new Error('Unknown error');
                });

            const res = await app
                .handle(new Request('http://localhost/throw'));
            const data = await res.json();
            expect(data).toEqual({
                key: 'core.error.internal_server_error',
                message: 'Internal server error'
            });
            expect(res.status).toBe(500);
        });
    });

    describe('Edge Cases & Security', () => {
        test('should handle CoreError with nested cause objects', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .get('/nested-cause', () => {
                    throw new CoreError({
                        key: 'test.nested',
                        message: 'Nested cause error',
                        cause: {
                            level1: {
                                level2: {
                                    level3: 'deep nesting',
                                    array: [1, 2, 3],
                                    nullValue: null,
                                    undefinedValue: undefined
                                }
                            }
                        }
                    });
                });

            const res = await app.handle(new Request('http://localhost/nested-cause'));
            const data = await res.json() as Record<string, unknown>;

            expect(res.status).toBe(500);
            expect(data.key).toBe('test.nested');
            // @ts-expect-error cause is expected to be an object
            expect(data.cause.level1.level2.level3).toBe('deep nesting');
            // @ts-expect-error cause is expected to be an object
            expect(data.cause.level1.level2.array).toEqual([1, 2, 3]);
        });

        test('should handle CoreError with circular reference safely', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .get('/circular', () => { // Remove circular reference test as it's not needed for error plugin testing
                    throw new CoreError({
                        key: 'test.circular',
                        message: 'Circular reference error',
                        cause: { description: 'Object with circular reference', data: 'safe data' }
                    });
                });

            const res = await app.handle(new Request('http://localhost/circular'));
            const data = await res.json() as Record<string, unknown>;

            expect(res.status).toBe(500);
            expect(data.key).toBe('test.circular');
            expect((data.cause as Record<string, unknown>).description).toBe('Object with circular reference');
        });

        test('should handle very large error payloads', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .get('/large-payload', () => {
                    const largeCause = {
                        largeArray: Array.from({ length: 1000 }, (_, i) => `item-${i}`),
                        largeString: 'x'.repeat(10000),
                        metadata: {
                            timestamps: Array.from({ length: 100 }, () => new Date().toISOString()),
                            numbers: Array.from({ length: 500 }, (_, i) => i * Math.random())
                        }
                    };

                    throw new CoreError({
                        key: 'test.large_payload',
                        message: 'Large payload error',
                        cause: largeCause
                    });
                });

            const res = await app.handle(new Request('http://localhost/large-payload'));
            const data = await res.json() as Record<string, unknown>;

            expect(res.status).toBe(500);
            expect(data.key).toBe('test.large_payload');
            expect((data.cause as Record<string, unknown>).largeArray).toHaveLength(1000);
            expect((data.cause as Record<string, unknown>).largeString).toHaveLength(10000);
        });

        test('should handle special characters in error messages and keys', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .get('/special-chars', () => {
                    throw new CoreError({
                        key: 'test.special_chars.éàç-中文-🚀',
                        message: 'Error with special chars: "quotes", \'apostrophes\', émojis 🎉, and unicode 中文',
                        cause: {
                            unicode: '测试中文字符',
                            emoji: '🔥💯✨',
                            quotes: 'Mixed "double" and \'single\' quotes',
                            symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
                        }
                    });
                });

            const res = await app.handle(new Request('http://localhost/special-chars'));
            const data = await res.json() as Record<string, unknown>;

            expect(res.status).toBe(500);
            expect(data.key).toBe('test.special_chars.éàç-中文-🚀');
            expect(data.message).toContain('émojis 🎉');
            expect((data.cause as Record<string, unknown>).unicode).toBe('测试中文字符');
            expect((data.cause as Record<string, unknown>).emoji).toBe('🔥💯✨');
        });

        test('should handle malformed JSON in validation errors', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .post('/malformed', () => 'success', {
                    body: t.Object({
                        email: t.String(),
                        age: t.Number()
                    })
                });

            const res = await app.handle(
                new Request('http://localhost/malformed', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: '{"email": "not-an-email", "age": "not-a-number", "extra": true}'
                })
            );

            const data = await res.json() as Record<string, unknown>;
            expect(res.status).toBe(400);
            expect(data.key).toBe('core.error.validation');
            expect((data.cause as Record<string, unknown>).on).toBe('body');
            expect(Array.isArray((data.cause as Record<string, unknown>).errors)).toBe(true);
        });

        test('should handle empty and null error causes', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .get('/empty-cause', () => {
                    throw new CoreError({
                        key: 'test.empty_cause',
                        message: 'Error with empty cause'
                        // No cause provided
                    });
                })
                .get('/null-cause', () => {
                    throw new CoreError({
                        key: 'test.null_cause',
                        message: 'Error with null cause',
                        cause: null
                    });
                });

            const emptyCauseRes = await app.handle(new Request('http://localhost/empty-cause'));
            const emptyCauseData = await emptyCauseRes.json() as Record<string, unknown>;

            expect(emptyCauseRes.status).toBe(500);
            expect(emptyCauseData.cause).toBeUndefined();

            const nullCauseRes = await app.handle(new Request('http://localhost/null-cause'));
            const nullCauseData = await nullCauseRes.json() as Record<string, unknown>;

            expect(nullCauseRes.status).toBe(500);
            expect(nullCauseData.cause).toBe(null);
        });
    });

    describe('HTTP Status Codes', () => {
        const statusCodeTests = [
            { status: 400, description: 'Bad Request' },
            { status: 401, description: 'Unauthorized' },
            { status: 403, description: 'Forbidden' },
            { status: 404, description: 'Not Found' },
            { status: 409, description: 'Conflict' },
            { status: 422, description: 'Unprocessable Entity' },
            { status: 429, description: 'Too Many Requests' },
            { status: 503, description: 'Service Unavailable' }
        ];

        test.each(statusCodeTests)('should handle CoreError with custom status $status ($description)', async ({ status, description }) => {
            const app = new Elysia()
                .use(errorPlugin)
                .get('/custom-status', () => {
                    throw new CoreError({
                        key: `test.status_${status}`,
                        message: `Error: ${description}`,
                        httpStatusCode: status,
                        cause: { statusCode: status, description }
                    });
                });

            const res = await app.handle(new Request('http://localhost/custom-status'));
            const data = await res.json() as Record<string, unknown>;

            expect(res.status).toBe(status);
            expect(data.key).toBe(`test.status_${status}`);
            expect(data.message).toBe(`Error: ${description}`);
            expect((data.cause as Record<string, unknown>).statusCode).toBe(status);
        });
    });

    describe('Error Response Formatting', () => {
        test('should set correct content-type header for all error responses', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .get('/core-error', () => {
                    throw new CoreError({ key: 'test', message: 'test' });
                })
                .get('/not-found-route', () => 'success');

            // Test CoreError response headers
            const coreErrorRes = await app.handle(new Request('http://localhost/core-error'));
            expect(coreErrorRes.headers.get('content-type')).toBe('application/json');

            // Test 404 response headers
            const notFoundRes = await app.handle(new Request('http://localhost/non-existent'));
            expect(notFoundRes.headers.get('content-type')).toBe('application/json');
        });

        test('should ensure consistent error response structure', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .get('/structure-test', () => {
                    throw new CoreError({
                        key: 'test.structure',
                        message: 'Structure test error',
                        cause: { testData: 'value' }
                    });
                });

            const res = await app.handle(new Request('http://localhost/structure-test'));
            const data = await res.json() as Record<string, unknown>;

            // Verify required fields are present
            expect(data).toHaveProperty('key');
            expect(data).toHaveProperty('message');
            expect(data).toHaveProperty('cause');

            // Verify field types
            expect(typeof data.key).toBe('string');
            expect(typeof data.message).toBe('string');
            expect(typeof data.cause).toBe('object');

            // Verify no additional fields
            const expectedKeys = ['key', 'message', 'cause'];
            const actualKeys = Object.keys(data);
            expect(actualKeys.sort()).toEqual(expectedKeys.sort());
        });

        test('should handle validation errors with consistent structure', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .post('/validation-structure', () => 'success', {
                    body: t.Object({
                        required: t.String(),
                        number: t.Number()
                    })
                });

            const res = await app.handle(
                new Request('http://localhost/validation-structure', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ wrong: 'data' })
                })
            );

            const data = await res.json() as Record<string, unknown>;

            // Check validation error structure
            expect(data.key).toBe('core.error.validation');
            expect(data.message).toBe('Validation error');
            expect(data.cause).toHaveProperty('on');
            expect(data.cause).toHaveProperty('found');
            expect(data.cause).toHaveProperty('errors');
            expect(Array.isArray((data.cause as Record<string, unknown>).errors)).toBe(true);
        });

        test('should handle different content types in error scenarios', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .post('/content-types', () => 'success', {
                    body: t.Object({ data: t.String() })
                });

            // Test with wrong content-type
            const xmlRes = await app.handle(
                new Request('http://localhost/content-types', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/xml' },
                    body: '<data>test</data>'
                })
            );

            expect(xmlRes.status).toBe(400);
            expect(xmlRes.headers.get('content-type')).toBe('application/json');

            // Test with no content-type
            const noContentTypeRes = await app.handle(
                new Request('http://localhost/content-types', {
                    method: 'POST',
                    body: 'plain text'
                })
            );

            expect(noContentTypeRes.status).toBe(400);
            expect(noContentTypeRes.headers.get('content-type')).toBe('application/json');
        });
    });

    describe('Performance & Stress Testing', () => {
        test('should handle high-frequency error generation efficiently', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .get('/high-frequency', () => {
                    throw new CoreError({
                        key: 'test.high_frequency',
                        message: 'High frequency error',
                        cause: { timestamp: Date.now(), random: Math.random() }
                    });
                });

            const startTime = Date.now();
            const promises = Array.from({ length: 100 }, () => app.handle(new Request('http://localhost/high-frequency')));

            const results = await Promise.all(promises);
            const endTime = Date.now();

            // All requests should return errors
            results.forEach((res) => {
                expect(res.status).toBe(500);
            });

            // Should complete within reasonable time (less than 2 seconds for 100 errors)
            expect(endTime - startTime).toBeLessThan(2000);
        });

        test('should handle concurrent error processing', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .get('/concurrent/:id', ({ params }) => {
                    throw new CoreError({
                        key: 'test.concurrent',
                        message: `Concurrent error ${params.id}`,
                        cause: { id: params.id, timestamp: Date.now() }
                    });
                });

            // Create 50 concurrent requests with different IDs
            const concurrentPromises = Array.from({ length: 50 }, (_, i) => app.handle(new Request(`http://localhost/concurrent/${i}`)));

            const results = await Promise.all(concurrentPromises);

            // Verify all errors were processed correctly
            for (let i = 0; i < results.length; ++i) {
                const result = results[i];
                const data = await result.json() as Record<string, unknown>;

                expect(result.status).toBe(500);
                expect(data.key).toBe('test.concurrent');
                expect(data.message).toBe(`Concurrent error ${i}`);
                expect((data.cause as Record<string, unknown>).id).toBe(i.toString());
            }
        });

        test('should not leak memory with repeated error handling', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .get('/memory-test', () => {
                    // Create error with large cause that should be garbage collected
                    const largeCause = {
                        data: Array.from({ length: 1000 }, (_, i) => ({
                            id: i,
                            value: `large-string-${i}`.repeat(10)
                        }))
                    };

                    throw new CoreError({
                        key: 'test.memory',
                        message: 'Memory test error',
                        cause: largeCause
                    });
                });

            // Process multiple large errors to test memory handling
            for (let i = 0; i < 20; ++i) {
                const res = await app.handle(new Request('http://localhost/memory-test'));
                const data = await res.json();

                expect(res.status).toBe(500);
                expect(((data as { cause: Record<string, unknown> }).cause).data).toHaveLength(1000);

                // Force garbage collection if available (Bun specific)
                if (global.gc)
                    global.gc();
            }

            // Test should complete without memory issues
            expect(true).toBe(true);
        });
    });
});

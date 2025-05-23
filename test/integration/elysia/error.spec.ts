import { describe, expect, test } from 'bun:test';
import { Elysia, t } from 'elysia';

import { errorPlugin } from '#/elysia/error';
import { CoreError } from '#/error/coreError';

describe('Error Plugin', () => {
    describe('onError', () => {
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
});

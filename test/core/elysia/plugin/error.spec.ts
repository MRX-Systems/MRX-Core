import { describe, expect, test } from 'bun:test';
import Elysia from 'elysia';
import { BasaltError as BasaltLoggerError } from '@basalt-lab/basalt-logger/error';
import { BasaltError as BasaltAuthError } from '@basalt-lab/basalt-auth/error';
import { BasaltError as BasaltHelperError } from '@basalt-lab/basalt-helper/error';

import { errorPlugin } from '#/core/elysia/plugin/error';
import { CoreError } from '#/error';

describe('Error Plugin', () => {
    describe('onError', () => {
        const errorCases: [string, typeof CoreError | typeof BasaltLoggerError | typeof BasaltAuthError | typeof BasaltHelperError][] = [
            ['CoreError', CoreError],
            ['BasaltLoggerError', BasaltLoggerError],
            ['BasaltAuthError', BasaltAuthError],
            ['BasaltHelperError', BasaltHelperError]
        ];

        test.each(errorCases)('should handle %s with status 500 and specific status', async (name, ErrorClass) => {
            console.log('name', name);
            const app = new Elysia()
                .use(errorPlugin)
                .get(`/throw/${name}`, () => {
                    throw new ErrorClass({
                        key: 'example',
                        message: 'Example message',
                        cause: {
                            foo: 'bar'
                        }
                    });
                })
                .get(`/throw/${name}/status`, () => {
                    throw new ErrorClass({
                        key: 'example',
                        message: 'Example message',
                        cause: {
                            foo: 'bar'
                        },
                        httpStatusCode: 400
                    });
                });

            const resDefaultStatus = await app
                .handle(new Request(`http://localhost/throw/${name}`))
                .then((res) => res.json());
            expect(resDefaultStatus).toEqual({
                key: 'example',
                message: 'Example message',
                cause: {
                    foo: 'bar'
                }
            });

            const resCustomStatus = await app
                .handle(new Request(`http://localhost/throw/${name}/status`));
            expect(await resCustomStatus.json()).toEqual({
                key: 'example',
                message: 'Example message',
                cause: {
                    foo: 'bar'
                }
            });
            expect(resCustomStatus.status).toBe(400);
        });

        test('should handle unknown errors with status 500', async () => {
            const error = new Error('Unknown error');
            const app = new Elysia()
                .use(errorPlugin)
                .get('/throw', () => {
                    throw error;
                });

            const res = await app
                .handle(new Request('http://localhost/throw'));
            expect(await res.json()).toEqual({
                message: 'Internal Server Error',
                cause: error
            });
            expect(res.status).toBe(500);
        });
    });
});

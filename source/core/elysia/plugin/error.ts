import { BasaltError as BasaltAuthError } from '@basalt-lab/basalt-auth/error';
import { BasaltError as BasaltHelperError } from '@basalt-lab/basalt-helper/error';
import { BasaltError as BasaltLoggerError } from '@basalt-lab/basalt-logger/error';
import { Elysia } from 'elysia';

import { CoreError } from '#/error';

/**
 * The `errorPlugin` handles errors for the Elysia application.
 *
 * It integrates various error types and provides a global error handler.
 */
export const errorPlugin = new Elysia({
    name: 'errorPlugin'
})
    .error({
        CoreError,
        BasaltAuthError,
        BasaltHelperError,
        BasaltLoggerError
    })
    .onError({ as: 'global' }, ({ code, error, set }) => {
        switch (code) {
            case 'CoreError':
            case 'BasaltAuthError':
            case 'BasaltHelperError':
            case 'BasaltLoggerError':
                set.status = error.httpStatusCode;
                return {
                    key: error.key,
                    message: error.message,
                    cause: error.cause
                };
        }
        return {
            message: 'Internal Server Error',
            cause: error
        };
    });
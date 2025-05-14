import { BasaltError as BasaltHelperError } from '@basalt-lab/basalt-helper/error';
import { BasaltError as BasaltLoggerError } from '@basalt-lab/basalt-logger/error';
import { Elysia } from 'elysia';

import { CoreError } from '#/error/coreError';

export const errorPlugin = new Elysia({
    name: 'errorPlugin'
})
    .error({
        CoreError,
        BasaltHelperError,
        BasaltLoggerError
    })
    .onError(({ code, error, set }) => {
        switch (code) {
            case 'CoreError':
            case 'BasaltHelperError':
            case 'BasaltLoggerError':
                set.status = error.httpStatusCode;
                return {
                    key: error.key,
                    message: error.message,
                    cause: error.cause
                };
            case 'VALIDATION': {
                set.status = 400;
                return {
                    key: 'core.error.validation',
                    message: 'Validation error',
                    cause: {
                        on: error.type,
                        found: error.value,
                        errors: error.all
                    }
                };
            }
            case 'NOT_FOUND':
                set.status = 404;
                return {
                    key: 'core.error.not_found',
                    message: 'Not found'
                };
            case 'INTERNAL_SERVER_ERROR':
            case 'UNKNOWN':
            default:
                set.status = 500;
                return {
                    key: 'core.error.internal_server_error',
                    message: 'Internal server error'
                };
        }
    })
    .as('global');
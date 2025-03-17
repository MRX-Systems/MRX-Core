import { BasaltError as BasaltHelperError } from '@basalt-lab/basalt-helper/error';
import { BasaltError as BasaltLoggerError } from '@basalt-lab/basalt-logger/error';
import { Elysia } from 'elysia';

import { CoreError } from '#/error/coreError';

/**
 * The `errorPlugin` provides a comprehensive error handling system for Elysia applications.
 * It centralizes error handling by registering multiple error types and implementing
 * a global error handler that transforms errors into a consistent response format.
 *
 * This plugin integrates with various error types from the application ecosystem:
 * - CoreError: Application-specific errors
 * - BasaltHelperError: Errors from the Basalt Helper library
 * - BasaltLoggerError: Errors from the Basalt Logger library
 * - Elysia's built-in errors (validation, not found, etc.)
 *
 * ### Key Features:
 * - Unified error handling across different error types
 * - Consistent error response formatting
 * - HTTP status code mapping based on error types
 * - Detailed error information for debugging while maintaining API consistency
 * - Support for validation errors with detailed feedback
 *
 * ### Error Response Format:
 * All errors are transformed into a consistent structure with:
 * - `key`: A unique identifier for the error type
 * - `message`: A human-readable description of the error
 * - `cause`: Additional context about what caused the error (when available)
 *
 * @example
 * ```typescript
 * // Register the error plugin with your Elysia application
 * const app = new Elysia()
 *   .use(errorPlugin)
 *   .get('/example', () => {
 *     // This will be caught and formatted by the error plugin
 *     throw new CoreError({
 *       key: 'core.error.resource_not_found',
 *       message: 'The requested resource was not found',
 *       httpStatusCode: 404,
 *       cause: { resourceId: 123 }
 *     });
 *   });
 *
 * // Example error responses:
 *
 * // 1. Custom application error
 * // HTTP 404
 * // {
 * //   "key": "core.error.resource_not_found",
 * //   "message": "The requested resource was not found",
 * //   "cause": { "resourceId": 123 }
 * // }
 *
 * // 2. Validation error
 * // HTTP 400
 * // {
 * //   "key": "core.error.validation",
 * //   "message": "Validation error",
 * //   "cause": {
 * //     "on": "body",
 * //     "found": { "name": 123 },
 * //     "errors": [ ... ]
 * //   }
 * // }
 *
 * // 3. Not found error
 * // HTTP 404
 * // {
 * //   "key": "core.error.not_found",
 * //   "message": "Not found"
 * // }
 * ```
 */
export const errorPlugin = new Elysia({
    name: 'errorPlugin'
})
    .error({
        CoreError,
        BasaltHelperError,
        BasaltLoggerError
    })
    .onError({ as: 'global' }, ({ code, error, set }) => {
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
    });
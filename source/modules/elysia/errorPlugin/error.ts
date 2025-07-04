import { Elysia } from 'elysia';

import { CoreError } from '#/error/coreError';

/**
 * The `errorPlugin` provides an error handling system for Elysia applications.
 *
 * This plugin integrates with various error types from the application ecosystem:
 * - `CoreError`: Application-specific errors
 * - `Elysia`'s built-in errors (validation, not found, etc.)
 */
export const errorPlugin = new Elysia({
	name: 'errorPlugin'
})
	.error({
		CoreError
	})
	.onError(({ code, error, set }) => {
		set.headers['content-type'] = 'application/json; charset=utf-8';
		switch (code) {
			case 'CoreError':
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
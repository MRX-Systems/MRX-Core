import { Elysia } from 'elysia';

import { BaseError } from '#/errors/baseError';
import { HttpError } from '#/errors/httpError';

/**
 * The `errorPlugin` provides an error handling system for Elysia applications.
 */
export const error = new Elysia({
	name: 'errorPlugin'
})
	.error({
		BaseError,
		HttpError
	})
	.onError(({ code, error, set }) => {
		set.headers['content-type'] = 'application/json; charset=utf-8';
		switch (code) {
			case 'HttpError':
				set.status = error.httpStatusCode;
				return {
					message: error.message,
					cause: error.cause
				};
			case 'BaseError':
				set.status = 500;
				return {
					message: error.message,
					cause: error.cause
				};
			case 'VALIDATION': {
				set.status = 422;
				return {
					message: 'core.error.validation',
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
					message: 'core.error.not_found'
				};
			case 'INTERNAL_SERVER_ERROR':
			case 'UNKNOWN':
			default:
				set.status = 500;
				return {
					message: 'core.error.internal_server_error'
				};
		}
	})
	.as('global');
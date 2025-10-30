import { Elysia, type TSchema } from 'elysia';

import { BaseError } from '#/errors/base-error';
import { HttpError } from '#/errors/http-error';
import { filterByKeyExclusion } from '#/modules/data/data';
import { ERROR_KEYS } from './enums/error.keys';

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
					content: error.cause
				};
			case 'BaseError':
				set.status = 500;
				return {
					message: error.message,
					content: error.cause
				};
			case 'VALIDATION': {
				set.status = 422;
				return {
					message: ERROR_KEYS.CORE_ERROR_VALIDATION,
					content: {
						on: error.type,
						errors: error.all.map((e) => ({
							path: (e as { path: string }).path,
							value: (e as { value: string }).value,
							summary: (e as { summary: string }).summary,
							message: (e as { schema: TSchema }).schema?.error,
							schema: filterByKeyExclusion((e as { schema: TSchema }).schema, ['error'], true)
						}))
					}
				};
			}
			case 'NOT_FOUND':
				set.status = 404;
				return {
					message: ERROR_KEYS.CORE_ERROR_NOT_FOUND
				};
			case 'PARSE':
				set.status = 400;
				return {
					message: ERROR_KEYS.CORE_ERROR_PARSE
				};
			case 'INTERNAL_SERVER_ERROR':
			case 'UNKNOWN':
			default:
				set.status = 500;
				return {
					message: ERROR_KEYS.CORE_ERROR_INTERNAL_SERVER_ERROR
				};
		}
	})
	.as('global');
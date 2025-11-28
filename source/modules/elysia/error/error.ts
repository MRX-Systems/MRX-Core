import { Elysia, type TSchema } from 'elysia';

import { InternalError } from '#/errors/internal-error';
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
		InternalError,
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
			case 'InternalError':
				set.status = 500;
				return {
					message: ERROR_KEYS.INTERNAL_SERVER_ERROR,
					content: error.uuid
				};
			case 'VALIDATION': {
				set.status = 422;
				return {
					message: ERROR_KEYS.VALIDATION,
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
					message: ERROR_KEYS.NOT_FOUND
				};
			case 'PARSE':
				set.status = 400;
				return {
					message: ERROR_KEYS.PARSE
				};
			case 'INTERNAL_SERVER_ERROR':
			case 'UNKNOWN':
			default:
				set.status = 500;
				return {
					message: ERROR_KEYS.INTERNAL_SERVER_ERROR
				};
		}
	})
	.as('global');
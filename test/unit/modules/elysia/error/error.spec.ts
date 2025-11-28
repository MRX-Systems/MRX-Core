import { describe, expect, test } from 'bun:test';
import { t, ValidationError } from 'elysia';

import { InternalError } from '#/errors/internal-error';
import { HttpError } from '#/errors/http-error';
import { ERROR_KEYS } from '#/modules/elysia/error/enums/error.keys';
import { error } from '#/modules/elysia/error/error';

describe.concurrent('error', () => {
	test('should have the error hook', () => {
		const { event } = error;
		expect(event).toBeDefined();
		expect(Array.isArray(event.error)).toBe(true);
		expect(event.error?.length).toBe(1);
	});

	test('should have the error handler', () => {
		const { event } = error;
		if (!event.error || event.error.length === 0)
			throw new Error('No error handler found');
		const [onErrorFn] = event.error;
		expect(onErrorFn).toBeDefined();
		expect(typeof onErrorFn.fn).toBe('function');
	});

	test('should have the error handler with correct global scope', () => {
		const { event } = error;
		if (!event.error || event.error.length === 0)
			throw new Error('No error handler found');
		const [onErrorFn] = event.error;
		expect(onErrorFn.scope).toBe('global');
	});

	test('should onError handle correctly HttpError code', () => {
		const { event } = error;
		if (!event.error || event.error.length === 0)
			throw new Error('No error handler found');
		const [onErrorFn] = event.error;
		const { fn } = onErrorFn;
		expect(fn).toBeDefined();

		const set = {
			status: 0,
			headers: {} as Record<string, string>
		};

		expect(fn({
			set,
			error: new HttpError('Test message', 400, 'Test cause'),
			code: 'HttpError'

		})).toEqual({
			message: 'Test message',
			content: 'Test cause'
		});
	});

	test('should onError handle correctly InternalError code', () => {
		const { event } = error;
		if (!event.error || event.error.length === 0)
			throw new Error('No error handler found');
		const [onErrorFn] = event.error;
		const { fn } = onErrorFn;
		expect(fn).toBeDefined();

		const set = {
			status: 0,
			headers: {} as Record<string, string>
		};

		const internalError = new InternalError('Test message', 'Test cause');

		const res = fn({
			set,
			error: internalError,
			code: 'InternalError'
		});

		expect(set.status).toBe(500);
		expect(res.message).toBe(ERROR_KEYS.INTERNAL_SERVER_ERROR);
		expect(res.content).toBe(internalError.uuid);
	});

	test('should onError handle correctly VALIDATION code', () => {
		const { event } = error;
		if (!event.error || event.error.length === 0)
			throw new Error('No error handler found');
		const [onErrorFn] = event.error;
		const { fn } = onErrorFn;
		expect(fn).toBeDefined();

		const set = {
			status: 0,
			headers: {} as Record<string, string>
		};

		expect(fn({
			set,
			error: new ValidationError('body', t.Object({
				e: t.Number({
					minimum: 2
				})
			}), { e: 1 }),
			code: 'VALIDATION'
		})).toEqual({
			message: ERROR_KEYS.VALIDATION,
			content: {
				on: 'body',
				errors: [
					{
						path: '/e',
						value: 1,
						summary: 'Expected number to be greater or equal to 2',
						schema: {
							minimum: 2,
							type: 'number'
						}
					}
				]
			}
		});
	});

	test('should onError handle correctly NOT_FOUND code', () => {
		const { event } = error;
		if (!event.error || event.error.length === 0)
			throw new Error('No error handler found');
		const [onErrorFn] = event.error;
		const { fn } = onErrorFn;
		expect(fn).toBeDefined();

		const set = {
			status: 0,
			headers: {} as Record<string, string>
		};

		expect(fn({
			set,
			error: new Error('Not found'),
			code: 'NOT_FOUND'
		})).toEqual({
			message: ERROR_KEYS.NOT_FOUND
		});
	});

	test('should onError handle correctly INTERNAL_SERVER_ERROR code', () => {
		const { event } = error;
		if (!event.error || event.error.length === 0)
			throw new Error('No error handler found');
		const [onErrorFn] = event.error;
		const { fn } = onErrorFn;
		expect(fn).toBeDefined();

		const set = {
			status: 0,
			headers: {} as Record<string, string>
		};

		expect(fn({
			set,
			error: new Error('Internal server error'),
			code: 'INTERNAL_SERVER_ERROR'
		})).toEqual({
			message: ERROR_KEYS.INTERNAL_SERVER_ERROR
		});
	});

	test('should onError handle correctly UNKNOWN code', () => {
		const { event } = error;
		if (!event.error || event.error.length === 0)
			throw new Error('No error handler found');
		const [onErrorFn] = event.error;
		const { fn } = onErrorFn;
		expect(fn).toBeDefined();

		const set = {
			status: 0,
			headers: {} as Record<string, string>
		};

		expect(fn({
			set,
			error: new Error('Unknown error'),
			code: 'UNKNOWN'
		})).toEqual({
			message: ERROR_KEYS.INTERNAL_SERVER_ERROR
		});
	});

	test('should onError handle correctly PARSE code', () => {
		const { event } = error;
		if (!event.error || event.error.length === 0)
			throw new Error('No error handler found');
		const [onErrorFn] = event.error;
		const { fn } = onErrorFn;
		expect(fn).toBeDefined();

		const set = {
			status: 0,
			headers: {} as Record<string, string>
		};

		expect(fn({
			set,
			error: new Error('Parse error'),
			code: 'PARSE'
		})).toEqual({
			message: ERROR_KEYS.PARSE
		});

		expect(set.status).toBe(400);
	});
});
import { describe, expect, test } from 'bun:test';

import { error } from '#/modules/elysia/error/error';
import { BaseError } from '#/errors/baseError';
import { HttpError } from '#/errors/httpError';

describe('error', () => {
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
			error: new HttpError({
				cause: 'Test cause',
				message: 'Test message',
				httpStatusCode: 400
			}),
			code: 'HttpError'

		})).toEqual({
			message: 'Test message',
			cause: 'Test cause'
		});
	});

	test('should onError handle correctly BaseError code', () => {
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
			error: new BaseError({
				cause: 'Test cause',
				message: 'Test message'
			}),
			code: 'BaseError'
		})).toEqual({
			message: 'Test message',
			cause: 'Test cause'
		});
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
			error: {
				type: 'test',
				value: 'test value',
				all: ['error1', 'error2']
			},
			code: 'VALIDATION'
		})).toEqual({
			message: 'core.error.validation',
			cause: {
				on: 'test',
				found: 'test value',
				errors: ['error1', 'error2']
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
			message: 'core.error.not_found'
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
			message: 'core.error.internal_server_error'
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
			message: 'core.error.internal_server_error'
		});
	});
});
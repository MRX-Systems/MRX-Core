import { describe, expect, test } from 'bun:test';

import { BaseError } from '#/errors/base-error';
import { HttpError } from '#/errors/http-error';

describe('Generic Type TCause', () => {
	describe('BaseError with typed cause', () => {
		test('should correctly type cause as specified generic', () => {
			interface CustomCause {
				code: number;
				details: string;
			}

			const error = new BaseError<CustomCause>(
				'Custom error',
				{ code: 1001, details: 'Something went wrong' }
			);

			expect(error.cause).toEqual({ code: 1001, details: 'Something went wrong' });

			// TypeScript should infer the correct type
			if (error.cause) {
				expect(error.cause.code).toBe(1001);
				expect(error.cause.details).toBe('Something went wrong');
			}
		});

		test('should handle undefined cause with generic type', () => {
			interface CustomCause {
				message: string;
			}

			const error = new BaseError<CustomCause>('Error without cause');

			expect(error.cause).toBeUndefined();
		});

		test('should work with primitive types as cause', () => {
			const stringCauseError = new BaseError<string>('Error with string', 'string cause');
			const numberCauseError = new BaseError<number>('Error with number', 42);

			expect(stringCauseError.cause).toBe('string cause');
			expect(numberCauseError.cause).toBe(42);
		});
	});

	describe('HttpError with typed cause', () => {
		test('should correctly type cause in HttpError', () => {
			interface ApiErrorCause {
				endpoint: string;
				method: string;
				statusCode: number;
			}

			const error = new HttpError<ApiErrorCause>(
				'API request failed',
				'BAD_REQUEST',
				{ endpoint: '/users', method: 'POST', statusCode: 400 }
			);

			expect(error.httpStatusCode).toBe(400);
			expect(error.cause).toEqual({ endpoint: '/users', method: 'POST', statusCode: 400 });

			if (error.cause) {
				expect(error.cause.endpoint).toBe('/users');
				expect(error.cause.method).toBe('POST');
				expect(error.cause.statusCode).toBe(400);
			}
		});

		test('should work with Error as cause type', () => {
			const originalError = new Error('Database connection failed');
			const httpError = new HttpError<Error>(
				'Service unavailable',
				'SERVICE_UNAVAILABLE',
				originalError
			);

			expect(httpError.cause).toBe(originalError);
			expect(httpError.httpStatusCode).toBe(503);

			if (httpError.cause) {
				expect(httpError.cause.message).toBe('Database connection failed');
				expect(httpError.cause).toBeInstanceOf(Error);
			}
		});

		test('should handle union types as cause', () => {
			type MixedCause = string | { code: number } | Error;

			// Test with string
			const stringError = new HttpError<MixedCause>('String cause', 'BAD_REQUEST', 'validation failed');
			expect(stringError.cause).toBe('validation failed');

			// Test with object
			const objectError = new HttpError<MixedCause>('Object cause', 'NOT_FOUND', { code: 404 });
			expect(objectError.cause).toEqual({ code: 404 });

			// Test with Error
			const errorCause = new Error('Original error');
			const errorError = new HttpError<MixedCause>('Error cause', 'INTERNAL_SERVER_ERROR', errorCause);
			expect(errorError.cause).toBe(errorCause);
		});
	});

	describe('Default behavior without generic type', () => {
		test('should use unknown as default type for cause', () => {
			const baseError = new BaseError('Default error', { anything: 'can go here' });
			const httpError = new HttpError('Default HTTP error', 'BAD_REQUEST', [1, 2, 3]);

			// These should work but cause will be typed as unknown
			expect(baseError.cause).toEqual({ anything: 'can go here' });
			expect(httpError.cause).toEqual([1, 2, 3]);
		});
	});
});

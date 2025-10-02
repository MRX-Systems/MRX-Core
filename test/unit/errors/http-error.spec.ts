import { describe, expect, test } from 'bun:test';

import { BaseError } from '#/errors/base-error';
import { HTTP_STATUS_CODES } from '#/errors/enums/http-status-codes';
import { HttpError } from '#/errors/http-error';

describe('HttpError', () => {
	describe('constructor', () => {
		test.concurrent('should create HttpError with message only (defaults to 500)', () => {
			const httpError = new HttpError('Internal server error');

			expect(httpError).toBeInstanceOf(HttpError);
			expect(httpError).toBeInstanceOf(BaseError);
			expect(httpError).toBeInstanceOf(Error);
			expect(httpError.message).toBe('Internal server error');
			expect(httpError.httpStatusCode).toBe(500);
			expect(httpError.cause).toBeUndefined();
			expect(httpError.name).toBe('HttpError');
			expect(httpError.date).toBeInstanceOf(Date);
		});

		test.concurrent('should create HttpError with message and numeric status code', () => {
			const httpError = new HttpError('Not found', 404);

			expect(httpError.message).toBe('Not found');
			expect(httpError.httpStatusCode).toBe(404);
			expect(httpError.cause).toBeUndefined();
		});

		test.concurrent('should create HttpError with message and status key', () => {
			const httpError = new HttpError('Unauthorized access', 'UNAUTHORIZED');

			expect(httpError.message).toBe('Unauthorized access');
			expect(httpError.httpStatusCode).toBe(401);
			expect(httpError.cause).toBeUndefined();
		});

		test('should create HttpError with message, status code, and cause', () => {
			const cause = { token: 'invalid' };
			const httpError = new HttpError('Token validation failed', 401, cause);

			expect(httpError.message).toBe('Token validation failed');
			expect(httpError.httpStatusCode).toBe(401);
			expect(httpError.cause).toBe(cause);
		});

		test('should create HttpError with message, status key, and cause', () => {
			const cause = { details: 'Missing required field' };
			const httpError = new HttpError('Validation error', 'BAD_REQUEST', cause);

			expect(httpError.message).toBe('Validation error');
			expect(httpError.httpStatusCode).toBe(400);
			expect(httpError.cause).toBe(cause);
		});

		test('should handle all available HTTP status codes', () => {
			const statusCodes = Object.keys(HTTP_STATUS_CODES) as (keyof typeof HTTP_STATUS_CODES)[];

			statusCodes.forEach((statusCode) => {
				const httpError = new HttpError(`Error for ${statusCode}`, statusCode);

				expect(httpError.httpStatusCode).toBe(HTTP_STATUS_CODES[statusCode]);
				expect(httpError.message).toBe(`Error for ${statusCode}`);
			});
		});

		test('should default to INTERNAL_SERVER_ERROR when invalid status is provided', () => {
			// Test with an invalid string that's not in HTTP_STATUS_CODES
			const httpError = new HttpError('Server error', 'INVALID_STATUS' as keyof typeof HTTP_STATUS_CODES);

			expect(httpError.httpStatusCode).toBe(500);
			expect(httpError.message).toBe('Server error');
		});

		test('should generate different dates for instances created at different times', () => {
			const error1 = new HttpError('Error 1');

			Bun.sleepSync(10);

			const error2 = new HttpError('Error 2');

			expect(error1.date.getTime()).toBeLessThanOrEqual(error2.date.getTime());
		});

		test('should preserve original Error properties in cause', () => {
			const originalError = new Error('Original error');
			const httpError = new HttpError('Wrapped HTTP error', 'INTERNAL_SERVER_ERROR', originalError);

			expect(httpError.cause).toBe(originalError);
			expect(httpError.stack).toContain('HttpError');
		});

		test('should handle different cause types', () => {
			// String cause
			const errorWithString = new HttpError('String cause error', 'BAD_REQUEST', 'String cause');
			expect(errorWithString.cause).toBe('String cause');

			// Number cause
			const errorWithNumber = new HttpError('Number cause error', 'NOT_FOUND', 404);
			expect(errorWithNumber.cause).toBe(404);

			// Object cause
			const errorWithObject = new HttpError('Object cause error', 'INTERNAL_SERVER_ERROR', { code: 500, details: 'Internal error' });
			expect(errorWithObject.cause).toEqual({ code: 500, details: 'Internal error' });
		});
	});

	describe('properties', () => {
		test('should return correct values from properties', () => {
			const httpError = new HttpError('Forbidden', 'FORBIDDEN', 'test cause');

			expect(httpError.date).toBeInstanceOf(Date);
			expect(httpError.httpStatusCode).toBe(403);
			expect(httpError.cause).toBe('test cause');
			expect(httpError.message).toBe('Forbidden');
			expect(httpError.name).toBe('HttpError');
		});

		test('should return immutable values', () => {
			const httpError = new HttpError('Unauthorized', 'UNAUTHORIZED');

			const originalDate = httpError.date;
			const originalHttpStatusCode = httpError.httpStatusCode;

			// Verify that properties return the same values on subsequent calls
			expect(httpError.date).toBe(originalDate);
			expect(httpError.httpStatusCode).toBe(originalHttpStatusCode);
		});

		test('should have readonly properties', () => {
			const httpError = new HttpError('Bad request', 'BAD_REQUEST');

			// In TypeScript, readonly properties are compile-time checks, not runtime
			// We test that the properties exist and are of correct types
			expect(httpError.date).toBeInstanceOf(Date);
			expect(httpError.httpStatusCode).toBe(400);

			// Verify the property descriptors exist
			const dateDescriptor = Object.getOwnPropertyDescriptor(httpError, 'date');
			const statusDescriptor = Object.getOwnPropertyDescriptor(httpError, 'httpStatusCode');
			expect(dateDescriptor).toBeTruthy();
			expect(statusDescriptor).toBeTruthy();
		});

		test('should have date close to creation time', () => {
			const beforeCreation = new Date();
			const httpError = new HttpError('test', 'BAD_REQUEST');
			const afterCreation = new Date();

			expect(httpError.date.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
			expect(httpError.date.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
		});
	});

	describe('isClientError', () => {
		test('should return true for 4xx status codes', () => {
			const clientErrorCodes: (keyof typeof HTTP_STATUS_CODES)[] = [
				'BAD_REQUEST',
				'UNAUTHORIZED',
				'FORBIDDEN',
				'NOT_FOUND',
				'METHOD_NOT_ALLOWED',
				'CONFLICT',
				'UNPROCESSABLE_ENTITY',
				'TOO_MANY_REQUESTS'
			];

			clientErrorCodes.forEach((statusCode) => {
				const httpError = new HttpError('Client error', statusCode);
				expect(httpError.isClientError).toBe(true);
				expect(httpError.isServerError).toBe(false);
			});
		});

		test('should return false for 5xx status codes', () => {
			const serverErrorCodes: (keyof typeof HTTP_STATUS_CODES)[] = [
				'INTERNAL_SERVER_ERROR',
				'NOT_IMPLEMENTED',
				'BAD_GATEWAY',
				'SERVICE_UNAVAILABLE',
				'GATEWAY_TIMEOUT'
			];

			serverErrorCodes.forEach((statusCode) => {
				const httpError = new HttpError('Server error', statusCode);
				expect(httpError.isClientError).toBe(false);
			});
		});
	});

	describe('isServerError', () => {
		test('should return true for 5xx status codes', () => {
			const serverErrorCodes: (keyof typeof HTTP_STATUS_CODES)[] = [
				'INTERNAL_SERVER_ERROR',
				'NOT_IMPLEMENTED',
				'BAD_GATEWAY',
				'SERVICE_UNAVAILABLE',
				'GATEWAY_TIMEOUT',
				'HTTP_VERSION_NOT_SUPPORTED',
				'INSUFFICIENT_STORAGE',
				'LOOP_DETECTED'
			];

			serverErrorCodes.forEach((statusCode) => {
				const httpError = new HttpError('Server error', statusCode);
				expect(httpError.isServerError).toBe(true);
				expect(httpError.isClientError).toBe(false);
			});
		});

		test('should return false for 4xx status codes', () => {
			const clientErrorCodes: (keyof typeof HTTP_STATUS_CODES)[] = [
				'BAD_REQUEST',
				'UNAUTHORIZED',
				'FORBIDDEN',
				'NOT_FOUND',
				'METHOD_NOT_ALLOWED',
				'CONFLICT'
			];

			clientErrorCodes.forEach((statusCode) => {
				const httpError = new HttpError('Client error', statusCode);
				expect(httpError.isServerError).toBe(false);
			});
		});
	});

	describe('inheritance', () => {
		test('should properly extend BaseError and Error classes', () => {
			const httpError = new HttpError('Test HTTP error');

			expect(httpError instanceof Error).toBe(true);
			expect(httpError instanceof BaseError).toBe(true);
			expect(httpError instanceof HttpError).toBe(true);
			expect(httpError.constructor).toBe(HttpError);
		});

		test('should have proper prototype chain', () => {
			const httpError = new HttpError('test');

			expect(Object.getPrototypeOf(httpError)).toBe(HttpError.prototype);
			expect(Object.getPrototypeOf(HttpError.prototype)).toBe(BaseError.prototype);
			expect(Object.getPrototypeOf(BaseError.prototype)).toBe(Error.prototype);
		});

		test('should be catchable as Error and BaseError', () => {
			try {
				throw new HttpError('Test HTTP error', 'NOT_FOUND');
			} catch (error) {
				expect(error).toBeInstanceOf(Error);
				expect(error).toBeInstanceOf(BaseError);
				expect(error).toBeInstanceOf(HttpError);
			}
		});

		test('should inherit all BaseError functionality', () => {
			const httpError = new HttpError('HTTP error message', 'UNAUTHORIZED', 'Some cause');

			// Should have BaseError properties
			expect(httpError.date).toBeInstanceOf(Date);
			expect(httpError.cause).toBe('Some cause');

			// Should have HttpError-specific properties
			expect(httpError.httpStatusCode).toBe(401);
			expect(httpError.isClientError).toBe(true);
			expect(httpError.isServerError).toBe(false);
		});
	});

	describe('edge cases', () => {
		test('should handle default status code when no status is provided', () => {
			const httpError = new HttpError('Error without status code');

			expect(httpError.httpStatusCode).toBe(500); // INTERNAL_SERVER_ERROR
			expect(httpError.isServerError).toBe(true);
			expect(httpError.isClientError).toBe(false);
		});

		test('should be serializable', () => {
			const httpError = new HttpError('Serializable error', 'BAD_REQUEST', { details: 'Some details' });

			const serialized = JSON.stringify({
				message: httpError.message,
				name: httpError.name,
				httpStatusCode: httpError.httpStatusCode,
				cause: httpError.cause,
				date: httpError.date.toISOString()
			});

			const parsed = JSON.parse(serialized) as {
				message: string;
				name: string;
				httpStatusCode: number;
				cause: { details: string };
				date: string;
			};

			expect(parsed.message).toBe('Serializable error');
			expect(parsed.httpStatusCode).toBe(400);
			expect(parsed.cause).toEqual({ details: 'Some details' });
			expect(parsed.name).toBe('HttpError');
		});

		test('should handle constructor overloads correctly', () => {
			// Overload 1: message only
			const error1 = new HttpError('message only');
			expect(error1.message).toBe('message only');
			expect(error1.httpStatusCode).toBe(500);
			expect(error1.cause).toBeUndefined();

			// Overload 2: message and cause (no status)
			const error2 = new HttpError('message with cause', { details: 'cause details' });
			expect(error2.message).toBe('message with cause');
			expect(error2.httpStatusCode).toBe(500);
			expect(error2.cause).toEqual({ details: 'cause details' });

			// Overload 2: message and numeric status
			const error3 = new HttpError('message with numeric status', 404);
			expect(error3.message).toBe('message with numeric status');
			expect(error3.httpStatusCode).toBe(404);
			expect(error3.cause).toBeUndefined();

			// Overload 2: message and string status
			const error4 = new HttpError('message with string status', 'BAD_REQUEST');
			expect(error4.message).toBe('message with string status');
			expect(error4.httpStatusCode).toBe(400);
			expect(error4.cause).toBeUndefined();
		});
	});
});

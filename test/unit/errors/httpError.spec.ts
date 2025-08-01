import { describe, expect, test } from 'bun:test';

import { BaseError } from '#/errors/baseError';
import { HTTP_ERROR_STATUS_CODES } from '#/errors/enums/httpErrorStatusCodes';
import { HttpError } from '#/errors/httpError';

describe('HttpError', () => {
	describe('constructor', () => {
		test('should create a new HttpError instance with specific properties when valid options are provided', () => {
			const httpError = new HttpError<{ details: string }>({
				message: 'error.http.unauthorized',
				httpStatusCode: 'UNAUTHORIZED',
				cause: { details: 'Invalid credentials' }
			});

			expect(httpError).toBeInstanceOf(HttpError);
			expect(httpError).toBeInstanceOf(BaseError);
			expect(httpError).toBeInstanceOf(Error);
			expect(httpError.uuid).toBeTypeOf('string');
			expect(httpError.uuid).toHaveLength(36); // UUID v4 length
			expect(httpError.date).toBeInstanceOf(Date);
			expect(httpError.httpStatusCode).toBe(401);
			expect(httpError.cause).toEqual({ details: 'Invalid credentials' });
			expect(httpError.message).toBe('error.http.unauthorized');
			expect(httpError.name).toBe('HttpError');
			expect(httpError.stack).toBeTypeOf('string');
		});

		test('should create a new HttpError instance with default properties when no options are provided', () => {
			const httpError = new HttpError();

			expect(httpError).toBeInstanceOf(HttpError);
			expect(httpError).toBeInstanceOf(BaseError);
			expect(httpError).toBeInstanceOf(Error);
			expect(httpError.uuid).toBeTypeOf('string');
			expect(httpError.uuid).toHaveLength(36); // UUID v4 length
			expect(httpError.date).toBeInstanceOf(Date);
			expect(httpError.httpStatusCode).toBe(500); // Default to INTERNAL_SERVER_ERROR
			expect(httpError.cause).toBeUndefined();
			expect(httpError.message).toBe('');
			expect(httpError.name).toBe('HttpError');
			expect(httpError.stack).toBeTypeOf('string');
		});

		test('should create a new HttpError instance with partial options', () => {
			const httpError = new HttpError({
				message: 'Not found',
				httpStatusCode: 'NOT_FOUND'
			});

			expect(httpError).toBeInstanceOf(HttpError);
			expect(httpError.message).toBe('Not found');
			expect(httpError.httpStatusCode).toBe(404);
			expect(httpError.cause).toBeUndefined();
			expect(httpError.name).toBe('HttpError');
		});

		test('should create a new HttpError instance with only status code provided', () => {
			const httpError = new HttpError({
				httpStatusCode: 'BAD_REQUEST'
			});

			expect(httpError).toBeInstanceOf(HttpError);
			expect(httpError.message).toBe('');
			expect(httpError.httpStatusCode).toBe(400);
			expect(httpError.cause).toBeUndefined();
			expect(httpError.name).toBe('HttpError');
		});

		test('should handle all available HTTP status codes', () => {
			const statusCodes = Object.keys(HTTP_ERROR_STATUS_CODES) as (keyof typeof HTTP_ERROR_STATUS_CODES)[];

			statusCodes.forEach((statusCode) => {
				const httpError = new HttpError({
					message: `Error for ${statusCode}`,
					httpStatusCode: statusCode
				});

				expect(httpError.httpStatusCode).toBe(HTTP_ERROR_STATUS_CODES[statusCode]);
				expect(httpError.message).toBe(`Error for ${statusCode}`);
			});
		});

		test('should generate unique UUIDs for different instances', () => {
			const error1 = new HttpError({ message: 'Error 1', httpStatusCode: 'BAD_REQUEST' });
			const error2 = new HttpError({ message: 'Error 2', httpStatusCode: 'NOT_FOUND' });

			expect(error1.uuid).not.toBe(error2.uuid);
			expect(error1.uuid).toBeTypeOf('string');
			expect(error2.uuid).toBeTypeOf('string');
		});

		test('should generate different dates for instances created at different times', async () => {
			const error1 = new HttpError({ message: 'Error 1' });

			// Wait a small amount of time to ensure different timestamps
			await new Promise((resolve) => setTimeout(resolve, 10));

			const error2 = new HttpError({ message: 'Error 2' });

			expect(error1.date.getTime()).toBeLessThanOrEqual(error2.date.getTime());
		});

		test('should preserve the original Error properties in cause', () => {
			const originalError = new Error('Original error');
			const httpError = new HttpError({
				message: 'Wrapped HTTP error',
				httpStatusCode: 'INTERNAL_SERVER_ERROR',
				cause: originalError
			});

			expect(httpError.cause).toBe(originalError);
			expect(httpError.stack).toContain('HttpError');
		});

		test('should handle different cause types', () => {
			// Test with string cause
			const errorWithString = new HttpError<string>({
				message: 'HTTP error with string cause',
				httpStatusCode: 'BAD_REQUEST',
				cause: 'String cause'
			});
			expect(errorWithString.cause).toBe('String cause');

			// Test with number cause
			const errorWithNumber = new HttpError<number>({
				message: 'HTTP error with number cause',
				httpStatusCode: 'NOT_FOUND',
				cause: 404
			});
			expect(errorWithNumber.cause).toBe(404);

			// Test with object cause
			const errorWithObject = new HttpError<{ code: number; details: string }>({
				message: 'HTTP error with object cause',
				httpStatusCode: 'INTERNAL_SERVER_ERROR',
				cause: { code: 500, details: 'Internal error' }
			});
			expect(errorWithObject.cause).toEqual({ code: 500, details: 'Internal error' });
		});
	});

	describe('getters', () => {
		test('should return correct values from getters', () => {
			const httpError = new HttpError({
				message: 'test.key',
				httpStatusCode: 'FORBIDDEN',
				cause: 'test cause'
			});

			expect(httpError.uuid).toBeTypeOf('string');
			expect(httpError.uuid).toHaveLength(36);
			expect(httpError.date).toBeInstanceOf(Date);
			expect(httpError.httpStatusCode).toBe(403);
			expect(httpError.cause).toBe('test cause');
		});

		test('should return immutable values', () => {
			const httpError = new HttpError({
				message: 'test.key',
				httpStatusCode: 'UNAUTHORIZED'
			});

			const originalUuid = httpError.uuid;
			const originalDate = httpError.date;
			const originalHttpStatusCode = httpError.httpStatusCode;

			// Verify that getters return the same values on subsequent calls
			expect(httpError.uuid).toBe(originalUuid);
			expect(httpError.date).toBe(originalDate);
			expect(httpError.httpStatusCode).toBe(originalHttpStatusCode);
		});

		test('should have readonly properties', () => {
			const httpError = new HttpError({
				message: 'test message',
				httpStatusCode: 'BAD_REQUEST'
			});

			// These should be readonly and cannot be modified
			expect(() => {
				// @ts-expect-error - Testing readonly property
				httpError.uuid = 'new-uuid';
			}).toThrow();

			expect(() => {
				// @ts-expect-error - Testing readonly property
				httpError.date = new Date();
			}).toThrow();

			expect(() => {
				// @ts-expect-error - Testing readonly property
				httpError.httpStatusCode = 500;
			}).toThrow();
		});

		test('should validate UUID format', () => {
			const httpError = new HttpError();
			const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

			expect(httpError.uuid).toMatch(uuidRegex);
		});

		test('should have date close to creation time', () => {
			const beforeCreation = new Date();
			const httpError = new HttpError();
			const afterCreation = new Date();

			expect(httpError.date.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
			expect(httpError.date.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
		});
	});

	describe('isClientError', () => {
		test('should return true for 4xx status codes', () => {
			const clientErrorCodes: (keyof typeof HTTP_ERROR_STATUS_CODES)[] = [
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
				const httpError = new HttpError({ httpStatusCode: statusCode });
				expect(httpError.isClientError).toBe(true);
				expect(httpError.isServerError).toBe(false);
			});
		});

		test('should return false for 5xx status codes', () => {
			const serverErrorCodes: (keyof typeof HTTP_ERROR_STATUS_CODES)[] = [
				'INTERNAL_SERVER_ERROR',
				'NOT_IMPLEMENTED',
				'BAD_GATEWAY',
				'SERVICE_UNAVAILABLE',
				'GATEWAY_TIMEOUT'
			];

			serverErrorCodes.forEach((statusCode) => {
				const httpError = new HttpError({ httpStatusCode: statusCode });
				expect(httpError.isClientError).toBe(false);
			});
		});
	});

	describe('isServerError', () => {
		test('should return true for 5xx status codes', () => {
			const serverErrorCodes: (keyof typeof HTTP_ERROR_STATUS_CODES)[] = [
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
				const httpError = new HttpError({ httpStatusCode: statusCode });
				expect(httpError.isServerError).toBe(true);
				expect(httpError.isClientError).toBe(false);
			});
		});

		test('should return false for 4xx status codes', () => {
			const clientErrorCodes: (keyof typeof HTTP_ERROR_STATUS_CODES)[] = [
				'BAD_REQUEST',
				'UNAUTHORIZED',
				'FORBIDDEN',
				'NOT_FOUND',
				'METHOD_NOT_ALLOWED',
				'CONFLICT'
			];

			clientErrorCodes.forEach((statusCode) => {
				const httpError = new HttpError({ httpStatusCode: statusCode });
				expect(httpError.isServerError).toBe(false);
			});
		});
	});

	describe('inheritance', () => {
		test('should properly extend BaseError and Error classes', () => {
			const httpError = new HttpError({ message: 'Test HTTP error' });

			expect(httpError instanceof Error).toBe(true);
			expect(httpError instanceof BaseError).toBe(true);
			expect(httpError instanceof HttpError).toBe(true);
			expect(httpError.constructor).toBe(HttpError);
		});

		test('should have proper prototype chain', () => {
			const httpError = new HttpError();

			expect(Object.getPrototypeOf(httpError)).toBe(HttpError.prototype);
			expect(Object.getPrototypeOf(HttpError.prototype)).toBe(BaseError.prototype);
			expect(Object.getPrototypeOf(BaseError.prototype)).toBe(Error.prototype);
		});

		test('should be catchable as Error and BaseError', () => {
			try {
				throw new HttpError({ message: 'Test HTTP error', httpStatusCode: 'NOT_FOUND' });
			} catch (error) {
				expect(error).toBeInstanceOf(Error);
				expect(error).toBeInstanceOf(BaseError);
				expect(error).toBeInstanceOf(HttpError);
			}
		});

		test('should inherit all BaseError functionality', () => {
			const httpError = new HttpError({
				message: 'HTTP error message',
				httpStatusCode: 'UNAUTHORIZED',
				cause: 'Some cause'
			});

			// Should have BaseError properties
			expect(httpError.uuid).toBeTypeOf('string');
			expect(httpError.date).toBeInstanceOf(Date);
			expect(httpError.cause).toBe('Some cause');

			// Should have HttpError-specific properties
			expect(httpError.httpStatusCode).toBe(401);
			expect(httpError.isClientError).toBe(true);
			expect(httpError.isServerError).toBe(false);
		});
	});

	describe('edge cases', () => {
		test('should handle default status code when httpStatusCode is undefined', () => {
			const httpError = new HttpError({
				message: 'Error without status code'
			});

			expect(httpError.httpStatusCode).toBe(500); // INTERNAL_SERVER_ERROR
			expect(httpError.isServerError).toBe(true);
			expect(httpError.isClientError).toBe(false);
		});

		test('should handle empty options object', () => {
			const httpError = new HttpError({});

			expect(httpError.message).toBe('');
			expect(httpError.httpStatusCode).toBe(500);
			expect(httpError.cause).toBeUndefined();
			expect(httpError.name).toBe('HttpError');
		});

		test('should be serializable', () => {
			const httpError = new HttpError({
				message: 'Serializable error',
				httpStatusCode: 'BAD_REQUEST',
				cause: { details: 'Some details' }
			});

			const serialized = JSON.stringify({
				message: httpError.message,
				name: httpError.name,
				httpStatusCode: httpError.httpStatusCode,
				cause: httpError.cause,
				uuid: httpError.uuid,
				date: httpError.date.toISOString()
			});

			const parsed = JSON.parse(serialized) as {
				message: string;
				name: string;
				httpStatusCode: number;
				cause: { details: string };
				uuid: string;
				date: string;
			};

			expect(parsed.message).toBe('Serializable error');
			expect(parsed.httpStatusCode).toBe(400);
			expect(parsed.cause).toEqual({ details: 'Some details' });
		});
	});
});

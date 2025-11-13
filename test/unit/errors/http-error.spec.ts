import { describe, expect, test } from 'bun:test';

import { AppError } from '#/errors/app-error';
import { HTTP_STATUS_CODES } from '#/errors/enums/http-status-codes';
import { HttpError } from '#/errors/http-error';

describe.concurrent('HttpError', (): void => {
	describe.concurrent('when created with message only', (): void => {
		test('should instantiate as HttpError, AppError, and Error', (): void => {
			const httpError = new HttpError('Internal server error');

			expect(httpError).toBeInstanceOf(HttpError);
			expect(httpError).toBeInstanceOf(AppError);
			expect(httpError).toBeInstanceOf(Error);
			expect(httpError.name).toBe('HttpError');
		});

		test('should default to 500 status code', (): void => {
			const httpError = new HttpError('Internal server error');

			expect(httpError.httpStatusCode).toBe(500);
		});

		test('should preserve message and have no cause', (): void => {
			const httpError = new HttpError('Internal server error');

			expect(httpError.message).toBe('Internal server error');
			expect(httpError.cause).toBeUndefined();
		});

		test('should capture creation timestamp', (): void => {
			const httpError = new HttpError('Internal server error');

			expect(httpError.date).toBeInstanceOf(Date);
		});

		test('should generate UUID v7', (): void => {
			const httpError = new HttpError('Internal server error');

			expect(httpError.uuid).toBeTypeOf('string');
			expect(httpError.uuid).toHaveLength(36);
			expect(httpError.uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
		});
	});

	describe.concurrent('when created with numeric status code', (): void => {
		test('should use provided status code', (): void => {
			const httpError = new HttpError('Not found', 404);

			expect(httpError.httpStatusCode).toBe(404);
			expect(httpError.message).toBe('Not found');
			expect(httpError.cause).toBeUndefined();
		});
	});

	describe.concurrent('when created with status key', (): void => {
		test('should resolve status key to numeric code', (): void => {
			const httpError = new HttpError('Unauthorized access', 'UNAUTHORIZED');

			expect(httpError.httpStatusCode).toBe(401);
			expect(httpError.message).toBe('Unauthorized access');
			expect(httpError.cause).toBeUndefined();
		});

		test('should handle all available HTTP status codes', (): void => {
			const statusCodes = Object.keys(HTTP_STATUS_CODES) as (keyof typeof HTTP_STATUS_CODES)[];

			statusCodes.forEach((statusCode): void => {
				const httpError = new HttpError(`Error for ${statusCode}`, statusCode);

				expect(httpError.httpStatusCode).toBe(HTTP_STATUS_CODES[statusCode]);
				expect(httpError.message).toBe(`Error for ${statusCode}`);
			});
		});

		test('should default to 500 for invalid status key', (): void => {
			const httpError = new HttpError('Server error', 'INVALID_STATUS' as keyof typeof HTTP_STATUS_CODES);

			expect(httpError.httpStatusCode).toBe(500);
			expect(httpError.message).toBe('Server error');
		});
	});

	describe.concurrent('when created with message, numeric status, and cause', (): void => {
		test('should preserve all parameters', (): void => {
			const cause = { token: 'invalid' };
			const httpError = new HttpError('Token validation failed', 401, cause);

			expect(httpError.message).toBe('Token validation failed');
			expect(httpError.httpStatusCode).toBe(401);
			expect(httpError.cause).toBe(cause);
		});
	});

	describe.concurrent('when created with message, status key, and cause', (): void => {
		test('should resolve status key and preserve cause', (): void => {
			const cause = { details: 'Missing required field' };
			const httpError = new HttpError('Validation error', 'BAD_REQUEST', cause);

			expect(httpError.message).toBe('Validation error');
			expect(httpError.httpStatusCode).toBe(400);
			expect(httpError.cause).toBe(cause);
		});
	});

	describe.concurrent('when cause has different types', (): void => {
		test('should accept string cause', () => {
			const errorWithString = new HttpError('String cause error', 'BAD_REQUEST', 'String cause');
			expect(errorWithString.cause).toBe('String cause');
		});

		test('should accept number cause', (): void => {
			const errorWithNumber = new HttpError('Number cause error', 'NOT_FOUND', 404);
			expect(errorWithNumber.cause).toBe(404);
		});

		test('should accept object cause', (): void => {
			const errorWithObject = new HttpError('Object cause error', 'INTERNAL_SERVER_ERROR', { code: 500, details: 'Internal error' });
			expect(errorWithObject.cause).toEqual({ code: 500, details: 'Internal error' });
		});

		test('should preserve original Error instance', (): void => {
			const originalError = new Error('Original error');
			const httpError = new HttpError('Wrapped HTTP error', 'INTERNAL_SERVER_ERROR', originalError);

			expect(httpError.cause).toBe(originalError);
			expect(httpError.stack).toContain('HttpError');
		});
	});

	describe.concurrent('when multiple instances are created', (): void => {
		test('should generate different timestamps', (): void => {
			const error1 = new HttpError('Error 1');

			Bun.sleepSync(10);

			const error2 = new HttpError('Error 2');

			expect(error1.date.getTime()).toBeLessThanOrEqual(error2.date.getTime());
		});
	});

	describe.concurrent('when accessed for properties', (): void => {
		test('should return correct values', (): void => {
			const httpError = new HttpError('Forbidden', 'FORBIDDEN', 'test cause');

			expect(httpError.date).toBeInstanceOf(Date);
			expect(httpError.httpStatusCode).toBe(403);
			expect(httpError.cause).toBe('test cause');
			expect(httpError.message).toBe('Forbidden');
			expect(httpError.name).toBe('HttpError');
		});

		test('should return consistent values across accesses', (): void => {
			const httpError = new HttpError('Unauthorized', 'UNAUTHORIZED');

			const originalDate = httpError.date;
			const originalHttpStatusCode = httpError.httpStatusCode;

			expect(httpError.date).toBe(originalDate);
			expect(httpError.httpStatusCode).toBe(originalHttpStatusCode);
		});

		test('should have immutable properties', (): void => {
			const httpError = new HttpError('Bad request', 'BAD_REQUEST');

			expect(httpError.date).toBeInstanceOf(Date);
			expect(httpError.httpStatusCode).toBe(400);

			const dateDescriptor = Object.getOwnPropertyDescriptor(httpError, 'date');
			const statusDescriptor = Object.getOwnPropertyDescriptor(httpError, 'httpStatusCode');
			expect(dateDescriptor).toBeTruthy();
			expect(statusDescriptor).toBeTruthy();
		});

		test('should have date close to creation time', (): void => {
			const beforeCreation = new Date();
			const httpError = new HttpError('test', 'BAD_REQUEST');
			const afterCreation = new Date();

			expect(httpError.date.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
			expect(httpError.date.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
		});
	});

	describe.concurrent('when checking isClientError', (): void => {
		test('should return true for 4xx status codes', (): void => {
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

			clientErrorCodes.forEach((statusCode): void => {
				const httpError = new HttpError('Client error', statusCode);
				expect(httpError.isClientError).toBe(true);
			});
		});

		test('should return false for 5xx status codes', (): void => {
			const serverErrorCodes: (keyof typeof HTTP_STATUS_CODES)[] = [
				'INTERNAL_SERVER_ERROR',
				'NOT_IMPLEMENTED',
				'BAD_GATEWAY',
				'SERVICE_UNAVAILABLE',
				'GATEWAY_TIMEOUT'
			];

			serverErrorCodes.forEach((statusCode): void => {
				const httpError = new HttpError('Server error', statusCode);
				expect(httpError.isClientError).toBe(false);
			});
		});
	});

	describe.concurrent('when checking isServerError', (): void => {
		test('should return true for 5xx status codes', (): void => {
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

			serverErrorCodes.forEach((statusCode): void => {
				const httpError = new HttpError('Server error', statusCode);
				expect(httpError.isServerError).toBe(true);
				expect(httpError.isClientError).toBe(false);
			});
		});

		test('should return false for 4xx status codes', (): void => {
			const clientErrorCodes: (keyof typeof HTTP_STATUS_CODES)[] = [
				'BAD_REQUEST',
				'UNAUTHORIZED',
				'FORBIDDEN',
				'NOT_FOUND',
				'METHOD_NOT_ALLOWED',
				'CONFLICT'
			];

			clientErrorCodes.forEach((statusCode): void => {
				const httpError = new HttpError('Client error', statusCode);
				expect(httpError.isServerError).toBe(false);
			});
		});
	});

	describe.concurrent('when inherited', (): void => {
		test('should extend AppError and Error classes', (): void => {
			const httpError = new HttpError('Test HTTP error');

			expect(httpError instanceof Error).toBe(true);
			expect(httpError instanceof AppError).toBe(true);
			expect(httpError instanceof HttpError).toBe(true);
			expect(httpError.constructor).toBe(HttpError);
		});

		test('should maintain proper prototype chain', (): void => {
			const httpError = new HttpError('test');

			expect(Object.getPrototypeOf(httpError)).toBe(HttpError.prototype);
			expect(Object.getPrototypeOf(HttpError.prototype)).toBe(AppError.prototype);
			expect(Object.getPrototypeOf(AppError.prototype)).toBe(Error.prototype);
		});

		test('should inherit all AppError functionality', (): void => {
			const httpError = new HttpError('HTTP error message', 'UNAUTHORIZED', 'Some cause');

			expect(httpError.date).toBeInstanceOf(Date);
			expect(httpError.cause).toBe('Some cause');
			expect(httpError.httpStatusCode).toBe(401);
			expect(httpError.isClientError).toBe(true);
			expect(httpError.isServerError).toBe(false);
		});
	});

	describe.concurrent('when thrown and caught', (): void => {
		test('should be catchable as Error, AppError, and HttpError', (): void => {
			try {
				throw new HttpError('Test HTTP error', 'NOT_FOUND');
			} catch (error) {
				expect(error).toBeInstanceOf(Error);
				expect(error).toBeInstanceOf(AppError);
				expect(error).toBeInstanceOf(HttpError);
			}
		});
	});

	describe.concurrent('when handling constructor overloads', (): void => {
		test('should handle message only', () => {
			const error = new HttpError('message only');
			expect(error.message).toBe('message only');
			expect(error.httpStatusCode).toBe(500);
			expect(error.cause).toBeUndefined();
		});

		test('should handle message with cause (no status)', (): void => {
			const error = new HttpError('message with cause', { details: 'cause details' });
			expect(error.message).toBe('message with cause');
			expect(error.httpStatusCode).toBe(500);
			expect(error.cause).toEqual({ details: 'cause details' });
		});

		test('should handle message with numeric status', (): void => {
			const error = new HttpError('message with numeric status', 404);
			expect(error.message).toBe('message with numeric status');
			expect(error.httpStatusCode).toBe(404);
			expect(error.cause).toBeUndefined();
		});

		test('should handle message with string status', (): void => {
			const error = new HttpError('message with string status', 'BAD_REQUEST');
			expect(error.message).toBe('message with string status');
			expect(error.httpStatusCode).toBe(400);
			expect(error.cause).toBeUndefined();
		});
	});

	describe.concurrent('when serialized', (): void => {
		test('should convert to JSON', (): void => {
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
	});

	describe.concurrent('edge cases', (): void => {
		test('should default to server error when no status provided', (): void => {
			const httpError = new HttpError('Error without status code');

			expect(httpError.httpStatusCode).toBe(500);
			expect(httpError.isServerError).toBe(true);
			expect(httpError.isClientError).toBe(false);
		});
	});
});

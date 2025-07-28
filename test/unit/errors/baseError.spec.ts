import { describe, expect, test } from 'bun:test';

import { BaseError } from '#/errors/baseError';

describe('BaseError', () => {
	describe('constructor', () => {
		test('should create a new BaseError instance with specific properties when valid options are provided', () => {
			const baseError = new BaseError<{ details: string }>({
				message: 'error.base.validation',
				cause: { details: 'Invalid input data' }
			});

			expect(baseError).toBeInstanceOf(BaseError);
			expect(baseError).toBeInstanceOf(Error);
			expect(baseError.uuid).toBeTypeOf('string');
			expect(baseError.uuid).toHaveLength(36); // UUID v4 length
			expect(baseError.date).toBeInstanceOf(Date);
			expect(baseError.cause).toEqual({ details: 'Invalid input data' });
			expect(baseError.message).toBe('error.base.validation');
			expect(baseError.name).toBe('BaseError');
			expect(baseError.stack).toBeTypeOf('string');
		});

		test('should create a new BaseError instance with default properties when no options are provided', () => {
			const baseError = new BaseError();

			expect(baseError).toBeInstanceOf(BaseError);
			expect(baseError).toBeInstanceOf(Error);
			expect(baseError.uuid).toBeTypeOf('string');
			expect(baseError.uuid).toHaveLength(36); // UUID v4 length
			expect(baseError.date).toBeInstanceOf(Date);
			expect(baseError.cause).toBeUndefined();
			expect(baseError.message).toBe('');
			expect(baseError.name).toBe('BaseError');
			expect(baseError.stack).toBeTypeOf('string');
		});

		test('should create a new BaseError instance with partial options', () => {
			const baseError = new BaseError({
				message: 'Something went wrong'
			});

			expect(baseError).toBeInstanceOf(BaseError);
			expect(baseError.message).toBe('Something went wrong');
			expect(baseError.cause).toBeUndefined();
			expect(baseError.name).toBe('BaseError');
		});

		test('should create a new BaseError instance with only cause provided', () => {
			const originalError = new Error('Original error');
			const baseError = new BaseError({
				cause: originalError
			});

			expect(baseError).toBeInstanceOf(BaseError);
			expect(baseError.message).toBe('');
			expect(baseError.cause).toBe(originalError);
			expect(baseError.name).toBe('BaseError');
		});

		test('should generate unique UUIDs for different instances', () => {
			const error1 = new BaseError({ message: 'Error 1' });
			const error2 = new BaseError({ message: 'Error 2' });

			expect(error1.uuid).not.toBe(error2.uuid);
			expect(error1.uuid).toBeTypeOf('string');
			expect(error2.uuid).toBeTypeOf('string');
		});

		test('should generate different dates for instances created at different times', async () => {
			const error1 = new BaseError({ message: 'Error 1' });

			// Wait a small amount of time to ensure different timestamps
			await new Promise((resolve) => setTimeout(resolve, 10));

			const error2 = new BaseError({ message: 'Error 2' });

			expect(error1.date.getTime()).toBeLessThanOrEqual(error2.date.getTime());
		});

		test('should preserve the original Error properties', () => {
			const originalError = new Error('Original error');
			const baseError = new BaseError({
				message: 'Wrapped error',
				cause: originalError
			});

			expect(baseError.cause).toBe(originalError);
			expect(baseError.stack).toContain('BaseError');
		});

		test('should handle different cause types', () => {
			// Test with string cause
			const errorWithString = new BaseError<string>({
				message: 'Error with string cause',
				cause: 'String cause'
			});
			expect(errorWithString.cause).toBe('String cause');

			// Test with number cause
			const errorWithNumber = new BaseError<number>({
				message: 'Error with number cause',
				cause: 404
			});
			expect(errorWithNumber.cause).toBe(404);

			// Test with object cause
			const errorWithObject = new BaseError<{ code: number; details: string }>({
				message: 'Error with object cause',
				cause: { code: 500, details: 'Internal error' }
			});
			expect(errorWithObject.cause).toEqual({ code: 500, details: 'Internal error' });
		});
	});

	describe('getters', () => {
		test('should return correct values from getters', () => {
			const baseError = new BaseError({
				message: 'test.key',
				cause: 'test cause'
			});

			expect(baseError.uuid).toBeTypeOf('string');
			expect(baseError.uuid).toHaveLength(36);
			expect(baseError.date).toBeInstanceOf(Date);
			expect(baseError.cause).toBe('test cause');
		});

		test('should return immutable values', () => {
			const baseError = new BaseError({
				message: 'test.key'
			});

			const originalUuid = baseError.uuid;
			const originalDate = baseError.date;

			// Verify that getters return the same values on subsequent calls
			expect(baseError.uuid).toBe(originalUuid);
			expect(baseError.date).toBe(originalDate);
		});

		test('should have readonly properties', () => {
			const baseError = new BaseError({
				message: 'test message'
			});

			// These should be readonly and cannot be modified
			expect(() => {
				// @ts-expect-error - Testing readonly property
				baseError.uuid = 'new-uuid';
			}).toThrow();

			expect(() => {
				// @ts-expect-error - Testing readonly property
				baseError.date = new Date();
			}).toThrow();
		});

		test('should validate UUID format', () => {
			const baseError = new BaseError();
			const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

			expect(baseError.uuid).toMatch(uuidRegex);
		});

		test('should have date close to creation time', () => {
			const beforeCreation = new Date();
			const baseError = new BaseError();
			const afterCreation = new Date();

			expect(baseError.date.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
			expect(baseError.date.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
		});
	});

	describe('inheritance', () => {
		test('should properly extend Error class', () => {
			const baseError = new BaseError({ message: 'Test error' });

			expect(baseError instanceof Error).toBe(true);
			expect(baseError instanceof BaseError).toBe(true);
			expect(baseError.constructor).toBe(BaseError);
		});

		test('should have proper prototype chain', () => {
			const baseError = new BaseError();

			expect(Object.getPrototypeOf(baseError)).toBe(BaseError.prototype);
			expect(Object.getPrototypeOf(BaseError.prototype)).toBe(Error.prototype);
		});

		test('should be catchable as Error', () => {
			try {
				throw new BaseError({ message: 'Test error' });
			} catch (error) {
				expect(error).toBeInstanceOf(Error);
				expect(error).toBeInstanceOf(BaseError);
			}
		});
	});
});

import { describe, expect, test } from 'bun:test';

import { BaseError } from '#/errors/base-error';

describe('BaseError', () => {
	describe('constructor', () => {
		test.concurrent('should create a new BaseError instance with message and cause', () => {
			const cause = { details: 'Invalid input data' };
			const baseError = new BaseError('error.base.validation', cause);

			expect(baseError).toBeInstanceOf(BaseError);
			expect(baseError).toBeInstanceOf(Error);
			expect(baseError.date).toBeInstanceOf(Date);
			expect(baseError.cause).toEqual(cause);
			expect(baseError.message).toBe('error.base.validation');
			expect(baseError.name).toBe('BaseError');
			expect(baseError.stack).toBeTypeOf('string');
		});

		test.concurrent('should create a new BaseError instance with message only', () => {
			const baseError = new BaseError('Something went wrong');

			expect(baseError).toBeInstanceOf(BaseError);
			expect(baseError).toBeInstanceOf(Error);
			expect(baseError.date).toBeInstanceOf(Date);
			expect(baseError.cause).toBeUndefined();
			expect(baseError.message).toBe('Something went wrong');
			expect(baseError.name).toBe('BaseError');
			expect(baseError.stack).toBeTypeOf('string');
		});

		test('should create a new BaseError instance with empty message', () => {
			const baseError = new BaseError('');

			expect(baseError).toBeInstanceOf(BaseError);
			expect(baseError).toBeInstanceOf(Error);
			expect(baseError.date).toBeInstanceOf(Date);
			expect(baseError.cause).toBeUndefined();
			expect(baseError.message).toBe('');
			expect(baseError.name).toBe('BaseError');
			expect(baseError.stack).toBeTypeOf('string');
		});

		test('should preserve the original Error properties in cause', () => {
			const originalError = new Error('Original error');
			const baseError = new BaseError('Wrapped error', originalError);

			expect(baseError.cause).toBe(originalError);
			expect(baseError.stack).toContain('BaseError');
		});

		test('should handle different cause types', () => {
			// Test with string cause
			const errorWithString = new BaseError('Error with string cause', 'String cause');
			expect(errorWithString.cause).toBe('String cause');

			// Test with number cause
			const errorWithNumber = new BaseError('Error with number cause', 404);
			expect(errorWithNumber.cause).toBe(404);

			// Test with object cause
			const errorWithObject = new BaseError('Error with object cause', { code: 500, details: 'Internal error' });
			expect(errorWithObject.cause).toEqual({ code: 500, details: 'Internal error' });
		});

		test('should generate different dates for instances created at different times', () => {
			const error1 = new BaseError('Error 1');

			// Wait a small amount of time to ensure different timestamps
			Bun.sleepSync(10);

			const error2 = new BaseError('Error 2');

			expect(error1.date.getTime()).toBeLessThanOrEqual(error2.date.getTime());
		});
	});

	describe('properties', () => {
		test('should return correct values from properties', () => {
			const baseError = new BaseError('test.key', 'test cause');

			expect(baseError.date).toBeInstanceOf(Date);
			expect(baseError.cause).toBe('test cause');
			expect(baseError.message).toBe('test.key');
			expect(baseError.name).toBe('BaseError');
		});

		test('should return immutable date property', () => {
			const baseError = new BaseError('test.key');
			const originalDate = baseError.date;

			// Verify that getter returns the same value on subsequent calls
			expect(baseError.date).toBe(originalDate);
		});

		test('should have readonly date property', () => {
			const baseError = new BaseError('test message');

			// In TypeScript, readonly properties are compile-time checks, not runtime
			// We test that the property exists and is of correct type
			expect(baseError.date).toBeInstanceOf(Date);

			// Verify the property descriptor shows it exists
			const descriptor = Object.getOwnPropertyDescriptor(baseError, 'date');
			expect(descriptor).toBeTruthy();
		});

		test('should have date close to creation time', () => {
			const beforeCreation = new Date();
			const baseError = new BaseError('test');
			const afterCreation = new Date();

			expect(baseError.date.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
			expect(baseError.date.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
		});
	});

	describe('inheritance', () => {
		test('should properly extend Error class', () => {
			const baseError = new BaseError('Test error');

			expect(baseError instanceof Error).toBe(true);
			expect(baseError instanceof BaseError).toBe(true);
			expect(baseError.constructor).toBe(BaseError);
		});

		test('should have proper prototype chain', () => {
			const baseError = new BaseError('test');

			expect(Object.getPrototypeOf(baseError)).toBe(BaseError.prototype);
			expect(Object.getPrototypeOf(BaseError.prototype)).toBe(Error.prototype);
		});

		test('should be catchable as Error', () => {
			try {
				throw new BaseError('Test error');
			} catch (error) {
				expect(error).toBeInstanceOf(Error);
				expect(error).toBeInstanceOf(BaseError);
			}
		});

		test('should have correct error name from constructor', () => {
			class CustomError extends BaseError {}

			const baseError = new BaseError('test');
			const customError = new CustomError('test');

			expect(baseError.name).toBe('BaseError');
			expect(customError.name).toBe('CustomError');
		});
	});

	describe('edge cases', () => {
		test('should handle undefined cause', () => {
			const baseError = new BaseError('Error without cause');

			expect(baseError.cause).toBeUndefined();
			expect(baseError.message).toBe('Error without cause');
			expect(baseError.name).toBe('BaseError');
		});

		test('should be serializable', () => {
			const baseError = new BaseError('Serializable error', { details: 'Some details' });

			const serialized = JSON.stringify({
				message: baseError.message,
				name: baseError.name,
				cause: baseError.cause,
				date: baseError.date.toISOString()
			});

			const parsed = JSON.parse(serialized) as {
				message: string;
				name: string;
				cause: { details: string };
				date: string;
			};

			expect(parsed.message).toBe('Serializable error');
			expect(parsed.cause).toEqual({ details: 'Some details' });
			expect(parsed.name).toBe('BaseError');
		});

		test('should have stack trace when Error.captureStackTrace is available', () => {
			const baseError = new BaseError('Stack trace test');

			expect(baseError.stack).toBeTypeOf('string');
			expect(baseError.stack).toContain('BaseError');
		});
	});
});

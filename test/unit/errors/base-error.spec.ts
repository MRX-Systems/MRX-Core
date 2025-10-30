import { describe, expect, test } from 'bun:test';

import { BaseError } from '#/errors/base-error';

describe.concurrent('BaseError', (): void => {
	describe.concurrent('when created with message and cause', (): void => {
		test('should instantiate as BaseError and Error', (): void => {
			const cause = { details: 'Invalid input data' };
			const baseError = new BaseError('error.base.validation', cause);

			expect(baseError).toBeInstanceOf(BaseError);
			expect(baseError).toBeInstanceOf(Error);
		});

		test('should capture creation timestamp', (): void => {
			const baseError = new BaseError('error.base.validation', { details: 'Invalid input data' });

			expect(baseError.date).toBeInstanceOf(Date);
		});

		test('should preserve message and cause', (): void => {
			const cause = { details: 'Invalid input data' };
			const baseError = new BaseError('error.base.validation', cause);

			expect(baseError.message).toBe('error.base.validation');
			expect(baseError.cause).toEqual(cause);
		});

		test('should set correct name and stack', (): void => {
			const baseError = new BaseError('error.base.validation', { details: 'Invalid input data' });

			expect(baseError.name).toBe('BaseError');
			expect(baseError.stack).toBeTypeOf('string');
		});
	});

	describe.concurrent('when created with message only', (): void => {
		test('should instantiate successfully', () => {
			const baseError = new BaseError('Something went wrong');

			expect(baseError).toBeInstanceOf(BaseError);
			expect(baseError).toBeInstanceOf(Error);
		});

		test('should have undefined cause', (): void => {
			const baseError = new BaseError('Something went wrong');

			expect(baseError.cause).toBeUndefined();
		});

		test('should preserve message', (): void => {
			const baseError = new BaseError('Something went wrong');

			expect(baseError.message).toBe('Something went wrong');
		});

		test('should set correct name', (): void => {
			const baseError = new BaseError('Something went wrong');

			expect(baseError.name).toBe('BaseError');
		});
	});

	describe.concurrent('when created with empty message', (): void => {
		test('should instantiate successfully', () => {
			const baseError = new BaseError('');

			expect(baseError).toBeInstanceOf(BaseError);
			expect(baseError).toBeInstanceOf(Error);
		});

		test('should handle empty string', (): void => {
			const baseError = new BaseError('');

			expect(baseError.message).toBe('');
			expect(baseError.cause).toBeUndefined();
		});
	});

	describe.concurrent('when cause is an Error instance', () => {
		test('should preserve original Error', () => {
			const originalError = new Error('Original error');
			const baseError = new BaseError('Wrapped error', originalError);

			expect(baseError.cause).toBe(originalError);
		});

		test('should maintain distinct stack traces', (): void => {
			const originalError = new Error('Original error');
			const baseError = new BaseError('Wrapped error', originalError);

			expect(baseError.stack).toContain('BaseError');
		});
	});

	describe.concurrent('when cause has different types', (): void => {
		test('should accept string cause', () => {
			const baseError = new BaseError('Error with string cause', 'String cause');

			expect(baseError.cause).toBe('String cause');
		});

		test('should accept number cause', (): void => {
			const baseError = new BaseError('Error with number cause', 404);

			expect(baseError.cause).toBe(404);
		});

		test('should accept object cause', (): void => {
			const baseError = new BaseError('Error with object cause', { code: 500, details: 'Internal error' });

			expect(baseError.cause).toEqual({ code: 500, details: 'Internal error' });
		});
	});

	describe.concurrent('when multiple instances are created', (): void => {
		test('should generate different timestamps', (): void => {
			const error1 = new BaseError('Error 1');

			Bun.sleepSync(10);

			const error2 = new BaseError('Error 2');

			expect(error1.date.getTime()).toBeLessThanOrEqual(error2.date.getTime());
		});

		test('should capture creation time accurately', (): void => {
			const beforeCreation = new Date();
			const baseError = new BaseError('test');
			const afterCreation = new Date();

			expect(baseError.date.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
			expect(baseError.date.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
		});
	});

	describe.concurrent('when accessed for properties', (): void => {
		test('should return consistent date across accesses', (): void => {
			const baseError = new BaseError('test.key');
			const originalDate = baseError.date;

			expect(baseError.date).toBe(originalDate);
		});

		test('should have immutable date property', (): void => {
			const baseError = new BaseError('test message');

			expect(baseError.date).toBeInstanceOf(Date);

			const descriptor = Object.getOwnPropertyDescriptor(baseError, 'date');
			expect(descriptor).toBeTruthy();
		});

		test('should return correct values', (): void => {
			const baseError = new BaseError('test.key', 'test cause');

			expect(baseError.date).toBeInstanceOf(Date);
			expect(baseError.cause).toBe('test cause');
			expect(baseError.message).toBe('test.key');
			expect(baseError.name).toBe('BaseError');
		});
	});

	describe.concurrent('when inherited', (): void => {
		test('should extend Error class', (): void => {
			const baseError = new BaseError('Test error');

			expect(baseError instanceof Error).toBe(true);
			expect(baseError instanceof BaseError).toBe(true);
			expect(baseError.constructor).toBe(BaseError);
		});

		test('should maintain proper prototype chain', (): void => {
			const baseError = new BaseError('test');

			expect(Object.getPrototypeOf(baseError)).toBe(BaseError.prototype);
			expect(Object.getPrototypeOf(BaseError.prototype)).toBe(Error.prototype);
		});

		test('should preserve class name in subclasses', (): void => {
			class CustomError extends BaseError {}

			const baseError = new BaseError('test');
			const customError = new CustomError('test');

			expect(baseError.name).toBe('BaseError');
			expect(customError.name).toBe('CustomError');
		});
	});

	describe.concurrent('when thrown and caught', (): void => {
		test('should be catchable as Error', (): void => {
			try {
				throw new BaseError('Test error');
			} catch (error) {
				expect(error).toBeInstanceOf(Error);
				expect(error).toBeInstanceOf(BaseError);
			}
		});
	});

	describe.concurrent('when serialized', (): void => {
		test('should convert to JSON', (): void => {
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

		test('should have stack trace', (): void => {
			const baseError = new BaseError('Stack trace test');

			expect(baseError.stack).toBeTypeOf('string');
			expect(baseError.stack).toContain('BaseError');
		});
	});
});

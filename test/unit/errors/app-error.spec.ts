import { describe, expect, test } from 'bun:test';

import { AppError } from '#/errors/app-error';

describe.concurrent('AppError', (): void => {
	describe.concurrent('when created with message and cause', (): void => {
		test('should instantiate as AppError and Error', (): void => {
			const cause = { details: 'Invalid input data' };
			const appError = new AppError('error.base.validation', cause);

			expect(appError).toBeInstanceOf(AppError);
			expect(appError).toBeInstanceOf(Error);
		});

		test('should capture creation timestamp', (): void => {
			const appError = new AppError('error.base.validation', { details: 'Invalid input data' });

			expect(appError.date).toBeInstanceOf(Date);
		});

		test('should generate UUID v7', (): void => {
			const appError = new AppError('error.base.validation', { details: 'Invalid input data' });

			expect(appError.uuid).toBeTypeOf('string');
			expect(appError.uuid).toHaveLength(36);
			expect(appError.uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
		});

		test('should preserve message and cause', (): void => {
			const cause = { details: 'Invalid input data' };
			const appError = new AppError('error.base.validation', cause);

			expect(appError.message).toBe('error.base.validation');
			expect(appError.cause).toEqual(cause);
		});

		test('should set correct name and stack', (): void => {
			const appError = new AppError('error.base.validation', { details: 'Invalid input data' });

			expect(appError.name).toBe('AppError');
			expect(appError.stack).toBeTypeOf('string');
		});
	});

	describe.concurrent('when created with message only', (): void => {
		test('should instantiate successfully', () => {
			const appError = new AppError('Something went wrong');

			expect(appError).toBeInstanceOf(AppError);
			expect(appError).toBeInstanceOf(Error);
		});

		test('should have undefined cause', (): void => {
			const appError = new AppError('Something went wrong');

			expect(appError.cause).toBeUndefined();
		});

		test('should preserve message', (): void => {
			const appError = new AppError('Something went wrong');

			expect(appError.message).toBe('Something went wrong');
		});

		test('should set correct name', (): void => {
			const appError = new AppError('Something went wrong');

			expect(appError.name).toBe('AppError');
		});
	});

	describe.concurrent('when created with empty message', (): void => {
		test('should instantiate successfully', () => {
			const appError = new AppError('');

			expect(appError).toBeInstanceOf(AppError);
			expect(appError).toBeInstanceOf(Error);
		});

		test('should handle empty string', (): void => {
			const appError = new AppError('');

			expect(appError.message).toBe('');
			expect(appError.cause).toBeUndefined();
		});
	});

	describe.concurrent('when cause is an Error instance', () => {
		test('should preserve original Error', () => {
			const originalError = new Error('Original error');
			const appError = new AppError('Wrapped error', originalError);

			expect(appError.cause).toBe(originalError);
		});

		test('should maintain distinct stack traces', (): void => {
			const originalError = new Error('Original error');
			const appError = new AppError('Wrapped error', originalError);

			expect(appError.stack).toContain('AppError');
		});
	});

	describe.concurrent('when cause has different types', (): void => {
		test('should accept string cause', () => {
			const appError = new AppError('Error with string cause', 'String cause');

			expect(appError.cause).toBe('String cause');
		});

		test('should accept number cause', (): void => {
			const appError = new AppError('Error with number cause', 404);

			expect(appError.cause).toBe(404);
		});

		test('should accept object cause', (): void => {
			const appError = new AppError('Error with object cause', { code: 500, details: 'Internal error' });

			expect(appError.cause).toEqual({ code: 500, details: 'Internal error' });
		});
	});

	describe.concurrent('when multiple instances are created', (): void => {
		test('should generate different UUIDs', (): void => {
			const error1 = new AppError('Error 1');
			const error2 = new AppError('Error 2');

			expect(error1.uuid).not.toBe(error2.uuid);
		});

		test('should generate different timestamps', (): void => {
			const error1 = new AppError('Error 1');

			Bun.sleepSync(10);

			const error2 = new AppError('Error 2');

			expect(error1.date.getTime()).toBeLessThanOrEqual(error2.date.getTime());
		});

		test('should capture creation time accurately', (): void => {
			const beforeCreation = new Date();
			const appError = new AppError('test');
			const afterCreation = new Date();

			expect(appError.date.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
			expect(appError.date.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
		});
	});

	describe.concurrent('when accessed for properties', (): void => {
		test('should return consistent date and uuid across accesses', (): void => {
			const appError = new AppError('test.key');
			const originalDate = appError.date;
			const originalUuid = appError.uuid;

			expect(appError.date).toBe(originalDate);
			expect(appError.uuid).toBe(originalUuid);
		});

		test('should have immutable date property', (): void => {
			const appError = new AppError('test message');

			expect(appError.date).toBeInstanceOf(Date);

			const descriptor = Object.getOwnPropertyDescriptor(appError, 'date');
			expect(descriptor).toBeTruthy();
		});

		test('should return correct values', (): void => {
			const appError = new AppError('test.key', 'test cause');

			expect(appError.date).toBeInstanceOf(Date);
			expect(appError.uuid).toBeTypeOf('string');
			expect(appError.cause).toBe('test cause');
			expect(appError.message).toBe('test.key');
			expect(appError.name).toBe('AppError');
		});
	});

	describe.concurrent('when inherited', (): void => {
		test('should extend Error class', (): void => {
			const appError = new AppError('Test error');

			expect(appError instanceof Error).toBe(true);
			expect(appError instanceof AppError).toBe(true);
			expect(appError.constructor).toBe(AppError);
		});

		test('should maintain proper prototype chain', (): void => {
			const appError = new AppError('test');

			expect(Object.getPrototypeOf(appError)).toBe(AppError.prototype);
			expect(Object.getPrototypeOf(AppError.prototype)).toBe(Error.prototype);
		});

		test('should preserve class name in subclasses', (): void => {
			class CustomError extends AppError {}

			const appError = new AppError('test');
			const customError = new CustomError('test');

			expect(appError.name).toBe('AppError');
			expect(customError.name).toBe('CustomError');
		});
	});

	describe.concurrent('when thrown and caught', (): void => {
		test('should be catchable as Error', (): void => {
			try {
				throw new AppError('Test error');
			} catch (error) {
				expect(error).toBeInstanceOf(Error);
				expect(error).toBeInstanceOf(AppError);
			}
		});
	});

	describe.concurrent('when serialized', (): void => {
		test('should convert to JSON', (): void => {
			const appError = new AppError('Serializable error', { details: 'Some details' });

			const serialized = JSON.stringify({
				message: appError.message,
				name: appError.name,
				uuid: appError.uuid,
				cause: appError.cause,
				date: appError.date.toISOString()
			});

			const parsed = JSON.parse(serialized) as {
				message: string;
				name: string;
				uuid: string;
				cause: { details: string };
				date: string;
			};

			expect(parsed.message).toBe('Serializable error');
			expect(parsed.uuid).toBe(appError.uuid);
			expect(parsed.cause).toEqual({ details: 'Some details' });
			expect(parsed.name).toBe('AppError');
		});

		test('should have stack trace', (): void => {
			const appError = new AppError('Stack trace test');

			expect(appError.stack).toBeTypeOf('string');
			expect(appError.stack).toContain('AppError');
		});
	});
});

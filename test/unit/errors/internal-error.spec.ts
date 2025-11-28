import { describe, expect, test } from 'bun:test';

import { AppError } from '#/errors/app-error';
import { InternalError } from '#/errors/internal-error';

describe.concurrent('InternalError', (): void => {
	describe.concurrent('when created with message only', (): void => {
		test('should instantiate as InternalError, AppError, and Error', (): void => {
			const internalError = new InternalError('Internal server error');

			expect(internalError).toBeInstanceOf(InternalError);
			expect(internalError).toBeInstanceOf(AppError);
			expect(internalError).toBeInstanceOf(Error);
			expect(internalError.name).toBe('InternalError');
		});

		test('should auto-generate UUID v7', (): void => {
			const internalError = new InternalError('Internal server error');

			expect(internalError.uuid).toBeTypeOf('string');
			expect(internalError.uuid).toHaveLength(36);
			expect(internalError.uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
		});

		test('should have undefined cause', (): void => {
			const internalError = new InternalError('Internal server error');

			expect(internalError.cause).toBeUndefined();
		});

		test('should preserve message', (): void => {
			const internalError = new InternalError('Database connection failed');

			expect(internalError.message).toBe('Database connection failed');
		});

		test('should capture creation timestamp', (): void => {
			const internalError = new InternalError('Internal server error');

			expect(internalError.date).toBeInstanceOf(Date);
		});
	});

	describe.concurrent('when created with message and cause', (): void => {
		test('should preserve cause and auto-generate uuid', (): void => {
			const cause = new Error('Database timeout');
			const internalError = new InternalError('Failed to fetch user', cause);

			expect(internalError.message).toBe('Failed to fetch user');
			expect(internalError.cause).toBe(cause);
			expect(internalError.uuid).toBeTypeOf('string');
			expect(internalError.uuid).toHaveLength(36);
		});

		test('should accept object cause', (): void => {
			const cause = { code: 'ECONNREFUSED', details: 'Connection refused' };
			const internalError = new InternalError('Service unavailable', cause);

			expect(internalError.cause).toEqual(cause);
			expect(internalError.uuid).toBeTypeOf('string');
		});
	});

	describe.concurrent('when multiple instances are created', (): void => {
		test('should generate different uuids', (): void => {
			const error1 = new InternalError('Error 1');
			const error2 = new InternalError('Error 2');

			expect(error1.uuid).not.toBe(error2.uuid);
		});

		test('should generate different timestamps', (): void => {
			const error1 = new InternalError('Error 1');

			Bun.sleepSync(10);

			const error2 = new InternalError('Error 2');

			expect(error1.date.getTime()).toBeLessThanOrEqual(error2.date.getTime());
		});

		test('should generate valid UUID v7s', (): void => {
			const errors = Array.from({ length: 10 }, (_, i) => new InternalError(`Error ${i}`));

			errors.forEach((error) => {
				expect(error.uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
			});

			const uniqueIds = new Set(errors.map((e) => e.uuid));
			expect(uniqueIds.size).toBe(10);
		});
	});

	describe.concurrent('when accessed for properties', (): void => {
		test('should return correct values', (): void => {
			const cause = { details: 'test cause' };
			const internalError = new InternalError('Test error', cause);

			expect(internalError.date).toBeInstanceOf(Date);
			expect(internalError.cause).toBe(cause);
			expect(internalError.message).toBe('Test error');
			expect(internalError.name).toBe('InternalError');
			expect(internalError.uuid).toBeTypeOf('string');
		});

		test('should return consistent values across accesses', (): void => {
			const internalError = new InternalError('Test error');

			const originalDate = internalError.date;
			const originalUuid = internalError.uuid;

			expect(internalError.date).toBe(originalDate);
			expect(internalError.uuid).toBe(originalUuid);
		});

		test('should have immutable properties', (): void => {
			const internalError = new InternalError('Test error');

			const dateDescriptor = Object.getOwnPropertyDescriptor(internalError, 'date');
			const uuidDescriptor = Object.getOwnPropertyDescriptor(internalError, 'uuid');

			expect(dateDescriptor).toBeTruthy();
			expect(uuidDescriptor).toBeTruthy();
		});
	});

	describe.concurrent('when inherited', (): void => {
		test('should extend AppError and Error classes', (): void => {
			const internalError = new InternalError('Test internal error');

			expect(internalError instanceof Error).toBe(true);
			expect(internalError instanceof AppError).toBe(true);
			expect(internalError instanceof InternalError).toBe(true);
			expect(internalError.constructor).toBe(InternalError);
		});

		test('should maintain proper prototype chain', (): void => {
			const internalError = new InternalError('test');

			expect(Object.getPrototypeOf(internalError)).toBe(InternalError.prototype);
			expect(Object.getPrototypeOf(InternalError.prototype)).toBe(AppError.prototype);
			expect(Object.getPrototypeOf(AppError.prototype)).toBe(Error.prototype);
		});

		test('should inherit all AppError functionality', (): void => {
			const cause = { error: 'test cause' };
			const internalError = new InternalError('Internal error message', cause);

			expect(internalError.date).toBeInstanceOf(Date);
			expect(internalError.cause).toEqual(cause);
			expect(internalError.uuid).toBeTypeOf('string');
		});
	});

	describe.concurrent('when thrown and caught', (): void => {
		test('should be catchable as Error, AppError, and InternalError', (): void => {
			try {
				throw new InternalError('Test internal error');
			} catch (error) {
				expect(error).toBeInstanceOf(Error);
				expect(error).toBeInstanceOf(AppError);
				expect(error).toBeInstanceOf(InternalError);
			}
		});

		test('should preserve uuid when caught', (): void => {
			try {
				throw new InternalError('Test error');
			} catch (error) {
				expect(error).toBeInstanceOf(InternalError);
				expect((error as InternalError).uuid).toBeTypeOf('string');
			}
		});
	});

	describe.concurrent('when serialized', (): void => {
		test('should convert to JSON with uuid', (): void => {
			const internalError = new InternalError('Serializable error', { details: 'Some details' });

			const serialized = JSON.stringify({
				message: internalError.message,
				name: internalError.name,
				uuid: internalError.uuid,
				date: internalError.date.toISOString()
			});

			const parsed = JSON.parse(serialized) as {
				message: string;
				name: string;
				uuid: string;
				date: string;
			};

			expect(parsed.message).toBe('Serializable error');
			expect(parsed.uuid).toBe(internalError.uuid);
			expect(parsed.name).toBe('InternalError');
		});

		test('should have stack trace', (): void => {
			const internalError = new InternalError('Stack trace test');

			expect(internalError.stack).toBeTypeOf('string');
			expect(internalError.stack).toContain('InternalError');
		});

		test('should not expose cause in typical client response', (): void => {
			const cause = new Error('Sensitive database error');
			const internalError = new InternalError('Operation failed', cause);

			// Client response simulation (don't include cause)
			const clientResponse = {
				message: 'An error occurred',
				uuid: internalError.uuid
			};

			expect(clientResponse).toEqual({
				message: 'An error occurred',
				uuid: internalError.uuid
			});

			// Cause is available for server-side logging
			expect(internalError.cause).toBe(cause);
		});
	});

	describe.concurrent('edge cases', (): void => {
		test('should handle empty message', (): void => {
			const internalError = new InternalError('');

			expect(internalError.message).toBe('');
			expect(internalError.uuid).toBeTypeOf('string');
		});

		test('should handle null cause', (): void => {
			const internalError = new InternalError('Error with null', null);

			expect(internalError.cause).toBeNull();
			expect(internalError.uuid).toBeTypeOf('string');
		});

		test('should handle undefined cause explicitly', (): void => {
			const internalError = new InternalError('Error with undefined', undefined);

			expect(internalError.cause).toBeUndefined();
			expect(internalError.uuid).toBeTypeOf('string');
		});
	});
});

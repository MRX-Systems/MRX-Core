import { describe, expect, test } from 'bun:test';

import { CoreError } from '#/error/coreError';
import type { CoreErrorOptions } from '#/error/types/coreErrorOptions';

/**
* Test data constants for consistent testing across all test suites.
*/
const testData = {
	completeErrorOptions: {
		message: 'An example error occurred',
		key: 'error.core-package.example',
		httpStatusCode: 400,
		cause: { errorCode: 'E001', details: 'Invalid input data' }
	} as const,
	minimalErrorOptions: {
		message: 'Minimal error'
	} as const,
	httpStatusCode: {
		badRequest: 400,
		unauthorized: 401,
		forbidden: 403,
		notFound: 404,
		INTERNAL_SERVER_ERROR: 500
	} as const,
	errorKeys: {
		validation: 'error.validation.failed',
		authentification: 'error.auth.invalid_token',
		database: 'error.database.connection_failed'
	} as const
} as const;

/**
* Custom type definitions for testing purposes.
*/
interface DatabaseErrorCause {
	readonly connectionString: string;
	readonly timeoutMs: number;
}

interface ValidationErrorCause {
	readonly field: string;
	readonly value: unknown;
	readonly rule: string;
}

/**
* Helper function to create a CoreError with complete options for testing purposes.
* @returns A CoreError instance with all properties set.
*/
const _createCompleteError = (): CoreError<typeof testData.completeErrorOptions.cause> => new CoreError(testData.completeErrorOptions);

/**
* Helper function to create a minimal CoreError for testing purposes.
* @returns A CoreError instance with minimal configuration.
*/
const _createMinimalError = (): CoreError => new CoreError(testData.minimalErrorOptions);

/**
* Helper function to get current timestamp for date comparison tests.
* @returns Current timestamp in milliseconds.
*/
const _getCurrentTimestamp = (): number => Date.now();

describe('CoreError', () => {
	describe('when constructing with complete options', () => {
		test('should create instance with all specified properties', () => {
			const beforeCreation: number = _getCurrentTimestamp();
			const coreError: CoreError<typeof testData.completeErrorOptions.cause> = _createCompleteError();
			const afterCreation: number = _getCurrentTimestamp();

			expect(coreError).toBeInstanceOf(CoreError);
			expect(coreError).toBeInstanceOf(Error);
			expect(coreError.message).toBe(testData.completeErrorOptions.message);
			expect(coreError.name).toBe('CoreError');
			expect(coreError.key).toBe(testData.completeErrorOptions.key);
			expect(coreError.httpStatusCode).toBe(testData.completeErrorOptions.httpStatusCode);
			expect(coreError.cause).toEqual(testData.completeErrorOptions.cause);
			expect(coreError.stack).toBeDefined();
			expect(coreError.uuid).toBeDefined();
			expect(coreError.date).toBeDefined();
			expect(coreError.date.getTime()).toBeGreaterThanOrEqual(beforeCreation);
			expect(coreError.date.getTime()).toBeLessThanOrEqual(afterCreation);
		});

		test('should create instance with typed cause', () => {
			const databaseCause: DatabaseErrorCause = {
				connectionString: 'mssql://localhost:1433',
				timeoutMs: 5000
			};

			const errorOptions: CoreErrorOptions<DatabaseErrorCause> = {
				message: 'Database connection failed',
				key: testData.errorKeys.database,
				httpStatusCode: testData.httpStatusCode.INTERNAL_SERVER_ERROR,
				cause: databaseCause
			};
			const coreError = new CoreError<DatabaseErrorCause>(errorOptions);

			expect(coreError.cause).toEqual(databaseCause);
			expect(coreError.cause?.connectionString).toBe('mssql://localhost:1433');
			expect(coreError.cause?.timeoutMs).toBe(5000);
		});

		test('should create instance with Error cause', () => {
			const originalError: Error = new Error('Original error message');
			const errorOptions: CoreErrorOptions<Error> = {
				message: 'Wrapped error',
				key: 'error.wrapper.example',
				httpStatusCode: testData.httpStatusCode.badRequest,
				cause: originalError
			};
			const coreError = new CoreError<Error>(errorOptions);

			expect(coreError.cause).toBe(originalError);
			expect(coreError.cause?.message).toBe('Original error message');
		});
	});

	describe('when constructing with partial options', () => {
		test('should create instance with minimal options and apply defaults', () => {
			const coreError: CoreError = _createMinimalError();

			expect(coreError).toBeInstanceOf(CoreError);
			expect(coreError.message).toBe(testData.minimalErrorOptions.message);
			expect(coreError.key).toBe('');
			expect(coreError.httpStatusCode).toBe(500);
			expect(coreError.cause).toBeUndefined();
		});

		test('should create instance with only key specified', () => {
			const errorOptions: CoreErrorOptions = {
				key: testData.errorKeys.validation
			};
			const coreError: CoreError = new CoreError(errorOptions);

			expect(coreError.message).toBe('');
			expect(coreError.key).toBe(testData.errorKeys.validation);
			expect(coreError.httpStatusCode).toBe(500);
			expect(coreError.cause).toBeUndefined();
		});

		test('should create instance with only httpStatusCode specified', () => {
			const errorOptions: CoreErrorOptions = {
				httpStatusCode: testData.httpStatusCode.notFound
			};
			const coreError: CoreError = new CoreError(errorOptions);

			expect(coreError.message).toBe('');
			expect(coreError.key).toBe('');
			expect(coreError.httpStatusCode).toBe(testData.httpStatusCode.notFound);
			expect(coreError.cause).toBeUndefined();
		});
	});

	describe('when constructing with default options', () => {
		test('should create instance with all default values when no options provided', () => {
			const coreError: CoreError = new CoreError();

			expect(coreError).toBeInstanceOf(CoreError);
			expect(coreError).toBeInstanceOf(Error);
			expect(coreError.message).toBe('');
			expect(coreError.name).toBe('CoreError');
			expect(coreError.key).toBe('');
			expect(coreError.httpStatusCode).toBe(500);
			expect(coreError.cause).toBeUndefined();
			expect(coreError.stack).toBeDefined();
			expect(coreError.uuid).toBeDefined();
			expect(coreError.date).toBeDefined();
		});

		test('should create instance with undefined options', () => {
			const coreError: CoreError = new CoreError(undefined);

			expect(coreError.message).toBe('');
			expect(coreError.key).toBe('');
			expect(coreError.httpStatusCode).toBe(500);
			expect(coreError.cause).toBeUndefined();
		});
	});

	describe('when testing instance properties', () => {
		test('should generate unique UUIDs for different instances', () => {
			const error1: CoreError = new CoreError();
			const error2: CoreError = new CoreError();
			const error3: CoreError = new CoreError();

			expect(error1.uuid).not.toBe(error2.uuid);
			expect(error2.uuid).not.toBe(error3.uuid);
			expect(error1.uuid).not.toBe(error3.uuid);
			// check if UUIDs are in valid format
			expect(error1.uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
		});

		test('should have creation dates close to current time', () => {
			const beforeCreation: number = _getCurrentTimestamp();
			const coreError: CoreError = new CoreError();
			const afterCreation: number = _getCurrentTimestamp();

			expect(coreError.date).toBeInstanceOf(Date);
			expect(coreError.date.getTime()).toBeGreaterThanOrEqual(beforeCreation);
			expect(coreError.date.getTime()).toBeLessThanOrEqual(afterCreation);
		});

		test('should have different creation dates for instances created at different times', async () => {
			const error1: CoreError = new CoreError();
			await new Promise((resolve: (value: unknown) => void): void => {
				setTimeout(resolve, 1);
			});
			const error2: CoreError = new CoreError();

			expect(error1.date.getTime()).toBeLessThan(error2.date.getTime());
		});
	});

	describe('when testing getter methods', () => {
		test('should return correct uuid value', () => {
			const coreError: CoreError = new CoreError();
			const uuid: string = coreError.uuid;

			expect(typeof uuid).toBe('string');
			expect(uuid).toHaveLength(36);
			expect(uuid).toBe(coreError.uuid); // Should be consistent
		});

		test('should return correct date value', () => {
			const coreError: CoreError = new CoreError();
			const date: Date = coreError.date;

			expect(date).toBeInstanceOf(Date);
			expect(date).toBe(coreError.date); // Should be the same reference
		});

		test('should return correct key value', () => {
			const coreError: CoreError = new CoreError({
				key: testData.errorKeys.authentification
			});

			expect(coreError.key).toBe(testData.errorKeys.authentification);
		});

		test('should return correct httpStatusCode value', () => {
			const coreError: CoreError = new CoreError({
				httpStatusCode: testData.httpStatusCode.unauthorized
			});

			expect(coreError.httpStatusCode).toBe(testData.httpStatusCode.unauthorized);
		});
	});

	describe('when testing Error inheritance', () => {
		test('should be throwable as Error', () => {
			expect(() => {
				throw new CoreError({
					message: 'Test error',
					key: 'error.test'
				});
			}).toThrow(CoreError);
		});

		test('should be catchable as Error', () => {
			try {
				throw new CoreError({
					message: 'Test error for catching',
					key: 'error.catch.test'
				});
			} catch (error: unknown) {
				expect(error).toBeInstanceOf(Error);
				expect(error).toBeInstanceOf(CoreError);
				if (error instanceof CoreError) {
					expect(error.message).toBe('Test error for catching');
					expect(error.key).toBe('error.catch.test');
				}
			}
		});

		test('should maintain Error properties', () => {
			const coreError: CoreError = new CoreError({
				message: 'Error with stack trace'
			});

			expect(coreError.name).toBe('CoreError');
			expect(coreError.message).toBe('Error with stack trace');
			expect(coreError.stack).toBeDefined();
			expect(typeof coreError.stack).toBe('string');
		});
	});

	describe('when testing with complex cause types', () => {
		test('should handle validation error cause', () => {
			const validationCause: ValidationErrorCause = {
				field: 'email',
				value: 'invalid-email',
				rule: 'email_format'
			};
			const coreError = new CoreError<ValidationErrorCause>({
				message: 'Validation failed',
				key: testData.errorKeys.validation,
				httpStatusCode: testData.httpStatusCode.badRequest,
				cause: validationCause
			});

			expect(coreError.cause).toEqual(validationCause);
			expect(coreError.cause?.field).toBe('email');
			expect(coreError.cause?.value).toBe('invalid-email');
			expect(coreError.cause?.rule).toBe('email_format');
		});

		test('should handle nested error objects as cause', () => {
			const nestedCause = {
				primaryError: new Error('Primary failure'),
				secondaryError: new Error('Secondary failure'),
				context: {
					userId: 123,
					action: 'update_profile'
				}
			} as const;
			const coreError = new CoreError<typeof nestedCause>({
				message: 'Multiple errors occurred',
				key: 'error.multiple.failures',
				httpStatusCode: testData.httpStatusCode.INTERNAL_SERVER_ERROR,
				cause: nestedCause
			});

			expect(coreError.cause?.primaryError).toBeInstanceOf(Error);
			expect(coreError.cause?.secondaryError).toBeInstanceOf(Error);
			expect(coreError.cause?.context.userId).toBe(123);
			expect(coreError.cause?.context.action).toBe('update_profile');
		});
	});

	describe('when testing edge cases', () => {
		test('should handle empty string values and fallback to defaults for falsy numbers', () => {
			const coreError: CoreError = new CoreError({
				message: '',
				key: '',
				httpStatusCode: 0 // Should fallback to 500 since 0 is falsy
			});

			expect(coreError.message).toBe('');
			expect(coreError.key).toBe('');
			expect(coreError.httpStatusCode).toBe(500); // Defaults to 500 for falsy values
		});

		test('should handle null cause', () => {
			const coreError = new CoreError<null>({
				message: 'Error with null cause',
				cause: null
			});

			expect(coreError.cause).toBeNull();
		});

		test('should handle primitive cause types', () => {
			const stringCause = 'Simple string error';
			const numberCause = 404;
			const booleanCause = false;

			const stringError = new CoreError<string>({
				message: 'String cause error',
				cause: stringCause
			});
			const numberError = new CoreError<number>({
				message: 'Number cause error',
				cause: numberCause
			});
			const booleanError = new CoreError<boolean>({
				message: 'Boolean cause error',
				cause: booleanCause
			});

			expect(stringError.cause).toBe(stringCause);
			expect(numberError.cause).toBe(numberCause);
			expect(booleanError.cause).toBe(booleanCause);
		});
	});
});

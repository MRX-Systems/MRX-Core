import { type TSchema, Type } from '@sinclair/typebox';
import { beforeEach, describe, expect, test } from 'bun:test';

import { InternalError } from '#/errors/internal-error';
import { UTILS_ERROR_KEYS } from '#/shared/enums/utils-error-keys';
import { validateEnv } from '#/shared/utils/env';

describe('validateEnv', () => {
	/**
	 * Test data containing various environment variable configurations
	 * for testing different validation scenarios.
	 */
	const _testEnvironments = {
		validNumericPort: { port: 3000 },
		invalidStringPort: { port: 'not a number' },
		validStringConfig: {
			nodeEnv: 'production',
			dbHost: 'localhost',
			apiKey: 'secret-key'
		},
		invalidMissingRequired: {},
		validComplexConfig: {
			port: 8080,
			nodeEnv: 'development',
			debug: true,
			maxConnections: 100
		},
		invalidMixedTypes: {
			port: 'invalid',
			nodeEnv: 123,
			debug: 'not-boolean'
		}
	} as const;

	/**
	 * Common schemas used across multiple test cases
	 * to avoid duplication and improve maintainability.
	 */
	const _testSchemas = {
		simplePort: Type.Object({
			port: Type.Number()
		}),
		stringConfig: Type.Object({
			nodeEnv: Type.String(),
			dbHost: Type.String(),
			apiKey: Type.String()
		}),
		requiredPort: Type.Object({
			port: Type.Number()
		}),
		complexConfig: Type.Object({
			port: Type.Number(),
			nodeEnv: Type.String(),
			debug: Type.Boolean(),
			maxConnections: Type.Number()
		})
	} as const;

	describe('when validating invalid environment variables', () => {
		test('should throw InternalError when port is not a number', () => {
			expect(() => {
				validateEnv(_testSchemas.simplePort, _testEnvironments.invalidStringPort);
			}).toThrow(InternalError);
		});

		test('should throw InternalError when required environment variables are missing', () => {
			expect(() => {
				validateEnv(_testSchemas.requiredPort, _testEnvironments.invalidMissingRequired);
			}).toThrow(InternalError);
		});

		test('should throw InternalError when multiple environment variables have incorrect types', () => {
			expect(() => {
				validateEnv(_testSchemas.complexConfig, _testEnvironments.invalidMixedTypes);
			}).toThrow(InternalError);
		});

		test('should throw InternalError with correct error key', () => {
			try {
				validateEnv(_testSchemas.simplePort, _testEnvironments.invalidStringPort);
				expect.unreachable('Expected function to throw');
			} catch (error: unknown) {
				expect(error).toBeInstanceOf(InternalError);
				if (error instanceof InternalError)
					expect(error.message).toBe(UTILS_ERROR_KEYS.INVALID_ENVIRONMENT);
			}
		});

		test('should preserve original validation error as cause', () => {
			try {
				validateEnv(_testSchemas.simplePort, _testEnvironments.invalidStringPort);
				expect.unreachable('Expected function to throw');
			} catch (error: unknown) {
				expect(error).toBeInstanceOf(InternalError);
				if (error instanceof InternalError)
					expect(error.cause).toBeDefined();
			}
		});
	});

	describe('when validating valid environment variables', () => {
		test('should not throw when PORT is a valid number', () => {
			expect(() => {
				validateEnv(_testSchemas.simplePort, _testEnvironments.validNumericPort);
			}).not.toThrow();
		});

		test('should not throw when all string environment variables are valid', () => {
			expect(() => {
				validateEnv(_testSchemas.stringConfig, _testEnvironments.validStringConfig);
			}).not.toThrow();
		});

		test('should not throw when complex configuration is valid', () => {
			expect(() => {
				validateEnv(_testSchemas.complexConfig, _testEnvironments.validComplexConfig);
			}).not.toThrow();
		});
	});

	describe('when using default process.env parameter', () => {
		const _originalProcessEnv: NodeJS.ProcessEnv = process.env;

		beforeEach(() => {
			// Reset process.env to original state before each test
			process.env = { ..._originalProcessEnv };
		});

		test('should validate against process.env when no env parameter provided', () => {
			// Set up process.env with valid data
			process.env.port = '3000';

			const schema: TSchema = Type.Object({
				port: Type.String()
			});

			expect(() => {
				validateEnv(schema);
			}).not.toThrow();
		});

		test('should throw when process.env contains invalid data', () => {
			// Set up process.env with invalid data
			process.env.port = 'invalid-port';

			const schema: TSchema = Type.Object({
				port: Type.Number()
			});

			expect(() => {
				validateEnv(schema);
			}).toThrow(InternalError);
		});
	});

	describe('edge cases', () => {
		test('should handle empty schema', () => {
			const emptySchema: TSchema = Type.Object({});

			expect(() => {
				validateEnv(emptySchema, {});
			}).not.toThrow();
		});

		test('should handle schema with optional properties', () => {
			const schemaWithOptional: TSchema = Type.Object({
				requiredField: Type.String(),
				optionalField: Type.Optional(Type.String())
			});

			const envWithOnlyRequired = {
				requiredField: 'present'
			};

			expect(() => {
				validateEnv(schemaWithOptional, envWithOnlyRequired);
			}).not.toThrow();
		});

		test('should handle nested object schemas', () => {
			const nestedSchema: TSchema = Type.Object({
				database: Type.Object({
					host: Type.String(),
					port: Type.Number()
				})
			});

			const validNestedEnv = {
				database: {
					host: 'localhost',
					port: 5432
				}
			};

			expect(() => {
				validateEnv(nestedSchema, validNestedEnv);
			}).not.toThrow();
		});
	});
});
import type { TSchema } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

import { BaseError } from '#/errors/baseError';
import { UTILS_ERROR_KEYS } from './enums/utilsErrorKeys';

/**
 * Validates the environment variables based on the provided schema.
 *
 * @param schema - The schema to validate the environment variables against.
 * @param env - The environment variables to validate. Defaults to `process.env`.
 *
 * @throws ({@link BaseError}): If the environment variables are invalid based on the schema.
 */
export const validateEnv = (schema: TSchema, env: Record<string, unknown> = process.env): void => {
	try {
		// Parse and assert the environment variables using the provided schema
		Value.Assert(schema, Value.Parse(schema, env));
	} catch (error) {
		throw new BaseError({
			message: UTILS_ERROR_KEYS.INVALID_ENVIRONMENT,
			cause: error
		});
	}
};
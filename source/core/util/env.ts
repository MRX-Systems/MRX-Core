import type { TSchema } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

import { CoreError } from '#/error/coreError';
import { utilKeyError } from '#/error/key/utilKeyError';

/**
 * Validates the environment variables based on the provided schema.
 *
 * @param schema - The schema to validate the environment variables against.
 * @param env - The environment variables to validate. Defaults to `process.env`.
 *
 * @throws ({@link CoreError}): If the environment variables are invalid based on the schema. ({@link utilKeyError.invalidEnvironment})
 */
export const validateEnv = (schema: TSchema, env: Record<string, unknown> = process.env): void => {
    try {
        // Parse and assert the environment variables using the provided schema
        Value.Assert(schema, Value.Parse(schema, env));
    } catch (error) {
        throw new CoreError({
            key: utilKeyError.invalidEnvironment,
            cause: error
        });
    }
};
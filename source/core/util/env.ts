import type { TSchema } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

import { CoreError } from '#/error/coreError';
import { UTIL_KEY_ERROR } from '#/error/key/utilKeyError';

/**
 * Validate the environment variables based on the schema provided.
 *
 * @param schema - The schema to validate the environment variables ({@link TSchema})
 * @param env - The environment variables to validate. (default: `process.env`)
 *
 * @throws ({@link CoreError}) - If the environment variables are invalid based on the schema. ({@link UTIL_KEY_ERROR}.INVALID_ENVIRONMENT)
 */
export function validateEnv(schema: TSchema, env: Record<string, unknown> = process.env): void {
    try {
        const newEnv = Value.Parse(schema, env);
        Value.Assert(schema, newEnv);
    } catch (error) {
        throw new CoreError({
            key: UTIL_KEY_ERROR.INVALID_ENVIRONMENT,
            cause: error
        });
    }
}
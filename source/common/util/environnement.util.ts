/* eslint-disable new-cap */
import type { TSchema } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

import { CoreError } from '#/common/error/core.error.ts';
import { UTIL_ERRORS } from '#/common/error/key/util.error.ts';

/**
 * Validate the environment variables based on the schema provided.
 *
 * @param schema - The schema to validate the environment variables ({@link TSchema})
 * @param env - The environment variables to validate. (default: `process.env`)
 *
 * @throws ({@link CoreError}) - If the environment variables are invalid based on the schema. ({@link UTIL_ERRORS.INVALID_ENVIRONMENT})
 */
export function validateEnv(schema: TSchema, env: Record<string, unknown> = process.env): void {
    try {
        const newEnv = Value.Parse(schema, env);
        Value.Assert(schema, newEnv);
    } catch (error) {
        throw new CoreError({
            key: UTIL_ERRORS.INVALID_ENVIRONMENT,
            cause: error
        });
    }
}
import { CoreError } from '#/common/error/core.error.ts';
import { ErrorKeys } from '#/common/error/keys.error.ts';
import { type SchemaTypes, vine } from '#/common/lib/optional/vine/vine.ts';

/**
 * Validate the environment variables based on the schema provided.
 *
 * @param schema - The schema to validate the environment variables ({@link SchemaTypes})
 *
 * @throws ({@link CoreError}) - If the environment variables are invalid based on the schema. ({@link ErrorKeys.INVALID_ENVIRONMENT})
 */
export async function validateEnv(schema: SchemaTypes): Promise<void> {
    try {
        const validator = vine.compile(schema);
        await validator.validate(process.env);
    } catch (error) {
        throw new CoreError({
            messageKey: ErrorKeys.INVALID_ENVIRONMENT,
            detail: error
        });
    }
}

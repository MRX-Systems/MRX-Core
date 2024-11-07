import { CoreError, ErrorKeys } from '#/common/error/index.ts';
import { type SchemaTypes, vine } from '#/common/types/index.ts';

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

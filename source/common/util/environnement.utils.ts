import { CoreError, ErrorKeys } from '@/common/error/index.ts';
import { type SchemaTypes, vine } from '@/common/types/index.ts';

/**
 * Validate the environment variables.
 *
 * @param schema - The schema to validate the environment. ({@link SchemaTypes})
 *
 * @throws ({@link CoreError}) - When the environment is invalid. ({@link ErrorKeys.INVALID_ENVIRONMENT})
 */
export async function validateEnv(schema: SchemaTypes): Promise<void> {
    try {
        const validator = vine.compile(schema);
        await validator.validate(process.env);
    } catch (error) {
        throw new CoreError({
            messageKey: ErrorKeys.INVALID_ENVIRONMENT,
            detail: error,
        });
    }
}

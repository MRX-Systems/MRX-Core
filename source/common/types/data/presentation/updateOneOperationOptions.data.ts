import type { ObjectSchema } from 'fluent-json-schema';

/**
 * The update one operation configuration.
 */
export interface UpdateOneOperationOptions {
    inputSchema: ObjectSchema,
    outputSchema: ObjectSchema
}

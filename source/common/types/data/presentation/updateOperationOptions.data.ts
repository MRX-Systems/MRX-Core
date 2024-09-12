import type { ObjectSchema } from 'fluent-json-schema';

/**
 * The update operation configuration.
 */
export interface UpdateOperationOptions {
    searchSchema: ObjectSchema;
    inputSchema: ObjectSchema;
    outputSchema: ObjectSchema
}

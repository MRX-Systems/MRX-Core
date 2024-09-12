import type { ObjectSchema } from 'fluent-json-schema';

/**
 * The insert operation configuration.
 */
export interface InsertOperationOptions<T> {
    required: (keyof T)[];
    inputSchema: ObjectSchema,
    outputSchema: ObjectSchema
}

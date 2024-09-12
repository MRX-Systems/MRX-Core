import type { ObjectSchema } from 'fluent-json-schema';

/**
 * The delete operation configuration.
 */
export interface DeleteOperationOptions {
    searchSchema: ObjectSchema;
    outputSchema: ObjectSchema;
}

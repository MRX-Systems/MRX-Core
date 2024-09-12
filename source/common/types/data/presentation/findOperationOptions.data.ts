import type { ObjectSchema } from 'fluent-json-schema';

/**
 * The find operation configuration.
 */
export interface FindOperationOptions {
    searchSchema: ObjectSchema;
    outputSchema: ObjectSchema;
}

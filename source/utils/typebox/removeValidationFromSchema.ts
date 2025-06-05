import type { TSchema } from '@sinclair/typebox';

import { filterByKeyExclusionRecursive } from '#/data/data';

/**
 * Recursively removes all validation constraints from a TypeBox schema while preserving the structure.
 * For object schemas, it processes each property recursively.
 * For primitive schemas, it removes validation properties like minLength, maximum, pattern, etc.
 *
 * @param schema - The TypeBox schema to clean from validation constraints. ({@link TSchema})
 *
 * @returns A new schema without validation constraints
 */
export const removeValidationFromSchema = <TInputSchema extends TSchema>(schema: TInputSchema): TSchema => filterByKeyExclusionRecursive(schema, [
    'default',
    'minLength',
    'maxLength',
    'pattern',
    'format',
    'minimum',
    'maximum',
    'exclusiveMinimum',
    'exclusiveMaximum',
    'multipleOf',
    'minItems',
    'maxItems',
    'maxContains',
    'minContains',
    'minProperties',
    'maxProperties',
    'uniqueItems',
    'minimumTimestamp',
    'maximumTimestamp',
    'exclusiveMinimumTimestamp',
    'exclusiveMaximumTimestamp',
    'multipleOfTimestamp'
]) as TSchema;
import type { TObject } from '@sinclair/typebox';
import { t } from 'elysia/type-system';

/**
 * Creates a schema for field selection in search results.
 *
 * @template TInferedObject - The TypeBox object schema to create field selection for. Extends {@link TObject}
 *
 * @param schema - The base object schema to create field selection for. {@link TInferedObject}
 *
 * @returns A TypeBox union schema for selected fields
 */
export const createSelectedFieldsSchema = <TInferedObject extends TObject>(schema: TInferedObject) => t.Union([
    t.KeyOf(schema),
    t.Literal('*'),
    t.Array(t.Union([
        t.KeyOf(schema),
        t.Literal('*')
    ]), {
        minItems: 1
    })
], {
    description: 'Selected fields can be a single field, a wildcard "*", or an array of fields and/or wildcard "*".'
});
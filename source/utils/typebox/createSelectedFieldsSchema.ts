import type { TObject } from '@sinclair/typebox';
import { t } from 'elysia/type-system';

/**
 * Creates a schema for field selection in search results.
 *
 * @param schema - The base object schema to create field selection for. ({@link TObject})
 *
 * @returns An array schema of valid field names
 */
export const createSelectedFieldsSchema = <TInferedObject extends TObject>(schema: TInferedObject) => t.Array(t.Union([
    t.KeyOf(schema),
    t.Literal('*')
]), {
    minItems: 1,
    description: 'Fields to select in the search results. Use "*" for all fields.',
    default: ['*']
});
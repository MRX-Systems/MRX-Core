import type { TObject } from '@sinclair/typebox';
import { t } from 'elysia/type-system';

/**
 * Creates a schema for order by clause in search results.
 *
 * @param schema - The base object schema to create order by for. ({@link TObject})
 *
 * @returns A tuple schema with field name and direction
 */
export const createOrderBySchema = <TInferedObject extends TObject>(schema: TInferedObject) => t.Tuple([
    t.Extract(t.KeyOf(schema), t.String()),
    t.Union([t.Literal('asc'), t.Literal('desc')])
], {
    description: 'Field to order by and direction. Use "asc" for ascending or "desc" for descending order.',
    examples: [
        [Object.keys(schema.properties)[0], 'asc'],
        [Object.keys(schema.properties)[1], 'desc']
    ]
});
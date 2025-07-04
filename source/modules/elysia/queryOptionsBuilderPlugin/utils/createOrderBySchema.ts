import type { TObject } from '@sinclair/typebox';
import { t } from 'elysia/type-system';

/**
 * Creates a schema for order by clause in search results.
 *
 * @template TInferedObject - The TypeBox object schema to create order by for. Extends {@link TObject}
 *
 * @param schema - The base object schema to create order by for. {@link TInferedObject}
 *
 * @returns A tuple schema with field name and direction
 */
export const createOrderBySchema = <TInferedObject extends TObject>(schema: TInferedObject) => t.Union([
	t.Object({
		selectedField: t.KeyOf(schema),
		direction: t.Union([t.Literal('asc'), t.Literal('desc')])
	}),
	t.Array(t.Object({
		selectedField: t.KeyOf(schema),
		direction: t.Union([t.Literal('asc'), t.Literal('desc')])
	}), {
		minItems: 1,
		uniqueItems: true
	})
], {
	description: 'Order by is an item or array of items with a field to order by and direction. Use "asc" for ascending or "desc" for descending order.'
});
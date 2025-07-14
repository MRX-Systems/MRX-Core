import type { TObject } from '@sinclair/typebox';
import { t } from 'elysia/type-system';

import type { QSchema } from '#/modules/elysia/queryOptionsBuilderPlugin/types/qSchema';

/**
 * Creates a search query schema
 *
 * @template TInferedObject - The TypeBox object schema to create search queries for. Extends {@link TObject}
 *
 * @param schema - The base object schema to create search queries for. {@link TInferedObject}
 *
 * @returns A union schema for search queries
 */
export const createQSchema = <TInferedObject extends TObject>(schema: TInferedObject): QSchema<TInferedObject> => t.Union([
	t.Object({
		selectedFields: t.Union([
			t.KeyOf(schema),
			t.Array(t.KeyOf(schema), {
				minItems: 1,
				uniqueItems: true
			})
		]),
		value: t.Union([
			t.Number(),
			t.String()
		])
	}),
	t.Number(),
	t.String()
], {
	description: 'Search query that can be a simple string, an object with selected fields and value, or a number.'
});
import type { TObject } from '@sinclair/typebox/type';
import { t } from 'elysia';

import type { FiltersSchema } from '#/modules/elysia/crud/types/filter-schema';
import { createPropertiesSchema } from './create-properties-schema';
import { createQSchema } from './create-q-schema';

/**
 * Creates a filters schema that combines search queries and property filters.
 * The resulting schema includes a $q property for query operations and properties
 * from the source schema for field-specific filtering.
 *
 * @template TSourceSchema - The TypeBox object schema to create filters for
 *
 * @param schema - The base object schema to create filters for
 *
 * @returns A composite TypeBox schema containing query and property filter capabilities
 */
export const createFiltersSchema = <TSourceSchema extends TObject>(schema: TSourceSchema): FiltersSchema<TSourceSchema> => t.Composite([
	t.Object({
		$q: createQSchema(schema)
	}),
	createPropertiesSchema(schema)
], {
	minProperties: 1
});
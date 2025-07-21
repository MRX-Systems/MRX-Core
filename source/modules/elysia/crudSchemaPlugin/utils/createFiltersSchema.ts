import type { TComposite, TObject } from '@sinclair/typebox/type';
import { t } from 'elysia';

import type { QSchema } from '#/modules/elysia/crudSchemaPlugin/types/qSchema';
import { createPropertiesSchema } from './createPropertiesSchema';
import { createQSchema } from './createQSchema';

/**
 * Creates a filters schema that combines search queries and property filters.
 *
 * @template TSourceSchema - The TypeBox object schema to create filters for. Extends {@link TObject}
 *
 * @param schema - The base object schema to create filters for.
 *
 * @returns A TypeBox object schema for filters
 */
export const createFiltersSchema = <TSourceSchema extends TObject>(schema: TSourceSchema): TComposite<[
	TObject<{
		$q: QSchema<TSourceSchema>
	}>,
	ReturnType<typeof createPropertiesSchema<TSourceSchema>>
]> => t.Composite([
	t.Object({
		$q: createQSchema(schema)
	}),
	createPropertiesSchema(schema)
], {
	minProperties: 1
});
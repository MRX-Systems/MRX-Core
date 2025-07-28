import type { TObject } from '@sinclair/typebox';
import { t } from 'elysia/type-system';

import type { SelectedFieldsSchema } from '#/modules/elysia/crudSchema/types/selectedFieldSchema';

/**
 * Creates a schema for field selection in search results.
 *
 * @template TSourceSchema - The TypeBox object schema to create field selection for. Extends {@link TObject}
 *
 * @param schema - The base object schema to create field selection for. {@link TSourceSchema}
 *
 * @returns A TypeBox union schema for selected fields
 */
export const createSelectedFieldsSchema = <TSourceSchema extends TObject>(schema: TSourceSchema): SelectedFieldsSchema<TSourceSchema> => t.Union([
	t.KeyOf(schema),
	t.Literal('*'),
	t.Array(t.KeyOf(schema), {
		minItems: 1,
		uniqueItems: true
	})
]);
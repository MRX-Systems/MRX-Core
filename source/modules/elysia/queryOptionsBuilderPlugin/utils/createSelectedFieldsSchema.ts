import type { TObject } from '@sinclair/typebox';
import { t } from 'elysia/type-system';

import type { SelectedFieldsSchema } from '#/modules/elysia/queryOptionsBuilderPlugin/types/selectedFieldSchema';

/**
 * Creates a schema for field selection in search results.
 *
 * @template TInferedObject - The TypeBox object schema to create field selection for. Extends {@link TObject}
 *
 * @param schema - The base object schema to create field selection for. {@link TInferedObject}
 *
 * @returns A TypeBox union schema for selected fields
 */
export const createSelectedFieldsSchema = <TInferedObject extends TObject>(schema: TInferedObject): SelectedFieldsSchema<TInferedObject> => t.Union([
	t.KeyOf(schema),
	t.Literal('*'),
	t.Array(t.KeyOf(schema), {
		minItems: 1,
		uniqueItems: true
	})
], {
	description: 'Selected fields can be a single field, a wildcard "*", or an array of fields and/or wildcard "*".'
});
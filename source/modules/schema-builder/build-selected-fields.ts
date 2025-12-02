import type { TObject } from '@sinclair/typebox/type';
import { t } from 'elysia/type-system';

import type { SelectedFieldsSchema } from './types/selected-fields-schema';

/**
 * Build a SelectSchema for selected fields based on a given object schema
 *
 * @template TSourceSchema - The source object schema type.
 *
 * @param schema - The source object schema to build the SelectSchema for
 *
 * @returns A SelectSchema that allows selecting keys of the source schema, the wildcard '*', or an array of keys
 */
export const buildSelectedFieldsSchema = <const TSourceSchema extends TObject>(schema: TSourceSchema): SelectedFieldsSchema<TSourceSchema> => t.Union([
	t.KeyOf(schema),
	t.Literal('*'),
	t.Array(t.KeyOf(schema), {
		minItems: 1,
		uniqueItems: true
	})
]);
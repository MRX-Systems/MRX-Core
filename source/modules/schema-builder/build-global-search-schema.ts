import type { TObject } from '@sinclair/typebox/type';
import { t } from 'elysia/type-system';

import type { GlobalSearchSchema } from './types/global-search-schema';

/**
 * Build a GlobalSearchSchema.
 *
 * @template TSourceSchema - The type of the source object schema
 *
 * @param schema - The source object schema type.
 *
 * @returns A GlobalSearchSchema
 */
export const buildGlobalSearchSchema = <const TSourceSchema extends TObject>(schema: TSourceSchema): GlobalSearchSchema<TSourceSchema> => t.Union([
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
]);
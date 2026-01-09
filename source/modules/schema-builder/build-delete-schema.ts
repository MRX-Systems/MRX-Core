import type { TObject } from '@sinclair/typebox/type';
import { t } from 'elysia';

import { buildFilterSchema } from './build-filters-schema';
import { buildSelectedFieldsSchema } from './build-selected-fields';
import { cleanSchema } from './clean-schema';
import type { DeleteSchema } from './types/delete-schema';

/**
 * Creates a DeleteSchema.
 *
 * @template TSourceSchema - The TypeBox object schema to create delete capabilities for
 *
 * @param schema - The base object schema to create delete schema for.
 *
 * @returns A TypeBox object schema containing queryOptions with selected fields and filters for delete operations
 */
export const buildDeleteSchema = <TSourceDeleteSchema extends TObject>(schema: TSourceDeleteSchema): DeleteSchema<TSourceDeleteSchema> => {
	const sanitizedSchema = cleanSchema<TSourceDeleteSchema>(schema);
	const filterSchema = buildFilterSchema<TSourceDeleteSchema>(sanitizedSchema);

	return t.Object({
		queryOptions: t.Object({
			selectedFields: t.Optional(buildSelectedFieldsSchema(sanitizedSchema)),
			filters: t.Union([
				filterSchema,
				t.Array(filterSchema, { minItems: 1 })
			])
		})
	});
};
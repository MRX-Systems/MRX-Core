import type { TObject } from '@sinclair/typebox/type';
import { t } from 'elysia';

import { buildFilterSchema } from './build-filters-schema';
import { buildSelectedFieldsSchema } from './build-selected-fields';
import { cleanSchema } from './clean-schema';
import type { UpdateSchema } from './types/update-schema';

/**
 * Builds an UpdateSchema.
 *
 * @template TSourceUpdateSchema - The TypeBox object schema to build the update schema from.
 *
 * @param schema - The source object schema to build the update schema from.
 *
 * @returns The update schema.
 */
export const buildUpdateSchema = <TSourceUpdateSchema extends TObject>(schema: TSourceUpdateSchema): UpdateSchema<TSourceUpdateSchema> => {
	const sanitizedSchema = cleanSchema<TSourceUpdateSchema>(schema);
	const filterSchema = buildFilterSchema<TSourceUpdateSchema>(sanitizedSchema);

	return t.Object({
		queryOptions: t.Object({
			selectedFields: t.Optional(buildSelectedFieldsSchema(sanitizedSchema)),
			filters: t.Union([
				filterSchema,
				t.Array(filterSchema, { minItems: 1, uniqueItems: true })
			])
		}),
		data: t.Partial(schema)
	});
};
import type { TObject } from '@sinclair/typebox/type';
import { t } from 'elysia';

import { buildFilterSchema } from './build-filters-schema';
import { buildOrderBySchema } from './build-order-by-schema';
import { buildSelectedFieldsSchema } from './build-selected-fields';
import { cleanSchema } from './clean-schema';
import type { FindSchema } from './types/find-schema';

/**
 * Build a FindSchema.
 *
 * @template TSourceSchema - The source object schema type.
 *
 * @param schema - The base object schema to create search schemas for.
 *
 * @returns A TypeBox object schema for search with selected fields, order by, filters, limit, and offset
 */
export const buildFindSchema = <TSourceFindSchema extends TObject>(schema: TSourceFindSchema): FindSchema<TSourceFindSchema> => {
	const sanitizedSchema = cleanSchema<TSourceFindSchema>(schema);
	const filterSchema = buildFilterSchema<TSourceFindSchema>(sanitizedSchema);

	return t.Partial(t.Object({
		queryOptions: t.Partial(t.Object({
			selectedFields: buildSelectedFieldsSchema(sanitizedSchema),
			orderBy: buildOrderBySchema(sanitizedSchema),
			filters: t.Union([
				filterSchema,
				t.Array(filterSchema, { minItems: 1, uniqueItems: true })
			]),
			limit: t.Number({
				default: 100,
				minimum: 1
			}),
			offset: t.Number({
				default: 0,
				minimum: 0
			})
		}))
	}));
};
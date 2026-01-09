import type { TObject } from '@sinclair/typebox/type';
import { t } from 'elysia';

import { buildFilterSchema } from './build-filters-schema';
import { cleanSchema } from './clean-schema';
import type { CountSchema } from './types/count-schema';

/**
 * Build a CountSchema
 *
 * @template TSourceSchema - The TypeBox object schema to create count capabilities for
 *
 * @param schema - The source object schema type.
 *
 * @returns A CountSchema based on the provided schema
 */
export const buildCountSchema = <
	const TSourceCountSchema extends TObject
>(schema: TSourceCountSchema): CountSchema<TSourceCountSchema> => {
	const sanitizedSchema = cleanSchema<TSourceCountSchema>(schema);
	const filterSchema = buildFilterSchema<TSourceCountSchema>(sanitizedSchema);
	return t.Partial(t.Object({
		queryOptions: t.Partial(t.Object({
			filters: t.Union([
				filterSchema,
				t.Array(filterSchema, { minItems: 1, uniqueItems: true })
			])
		}))
	}));
};
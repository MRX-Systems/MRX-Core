import type { TObject } from '@sinclair/typebox/type';
import { t } from 'elysia';

import { buildAdaptiveWhereClauseSchema } from './build-adaptive-where-clause-schema';
import { buildGlobalSearchSchema } from './build-global-search-schema';
import type { FilterSchema } from './types/filter-schema';
import { flatten } from './utils/flatten';

/**
 * Build a FilterSchema for the given source object schema.
 *
 * @template TSourceSchema - The source object schema type.
 *
 * @param schema - The source object schema to build the FilterSchema for
 *
 * @returns A FilterSchema for the given source object schema
 */
export const buildFilterSchema = <const TSourceSchema extends TObject>(schema: TSourceSchema): FilterSchema<TSourceSchema> => {
	const clauseSchema = {
		$q: buildGlobalSearchSchema(schema)
	};

	for (const [key, propertySchema] of Object.entries(schema.properties))
	// @ts-expect-error // Generic can't be indexed
		clauseSchema[key] = flatten(t.Union([
			propertySchema,
			buildAdaptiveWhereClauseSchema(propertySchema)
		]));

	return t.Object(clauseSchema, {
		minProperties: 1
	}) as unknown as FilterSchema<TSourceSchema>;
};
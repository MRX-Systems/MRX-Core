import type { Static, TObject, TUnion } from '@sinclair/typebox/type';
import { t } from 'elysia';

import type { AdaptiveWhereClauseSchema } from '#/modules/elysia/crud/types/adaptive-where-clause-schema';
import type { PropertiesSchema } from '#/modules/elysia/crud/types/properties-schema';
import { createAdaptiveWhereClauseSchema } from './create-adaptive-where-clause-schema';

/**
 * Creates property schemas.
 *
 * @template TSourceSchema - The TypeBox object schema to create property schemas for
 *
 * @param schema - The base object schema to create property schemas for.
 *
 * @returns Record of property schemas with union types
 */
export const createPropertiesSchema = <TSourceSchema extends TObject>(schema: TSourceSchema): PropertiesSchema<TSourceSchema> => {
	const { properties } = schema;
	const clauseSchema = {} as {
		[K in keyof Static<TSourceSchema>]: TUnion<[
			AdaptiveWhereClauseSchema<TSourceSchema['properties'][K]>,
			TSourceSchema['properties'][K]
		]>
	};
	for (const [key, propertySchema] of Object.entries(properties))
	// @ts-expect-error // Generic can't be indexed
		clauseSchema[key] = t.Union([
			createAdaptiveWhereClauseSchema(propertySchema),
			propertySchema
		]);
	return t.Object(clauseSchema);
};
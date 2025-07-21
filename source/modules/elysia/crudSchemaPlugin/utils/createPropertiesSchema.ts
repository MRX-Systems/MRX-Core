import type { Static, TObject, TUnion } from '@sinclair/typebox/type';
import { t } from 'elysia';

import { createAdaptiveWhereClauseSchema } from './createAdaptiveWhereClauseSchema';

/**
 * Creates property schemas.
 *
 * @template TSourceSchema - The TypeBox object schema to create property schemas for
 *
 * @param schema - The base object schema to create property schemas for.
 *
 * @returns Record of property schemas with union types
 */
export const createPropertiesSchema = <TSourceSchema extends TObject>(schema: TSourceSchema): TObject<{
	[K in keyof Static<TSourceSchema>]: TUnion<[
		ReturnType<typeof createAdaptiveWhereClauseSchema<TSourceSchema['properties'][K]>>,
		TSourceSchema['properties'][K]
	]>
}> => {
	const { properties } = schema;
	const clauseSchema = {} as {
		[K in keyof Static<TSourceSchema>]: TUnion<[
			ReturnType<typeof createAdaptiveWhereClauseSchema<TSourceSchema['properties'][K]>>,
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

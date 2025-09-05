import type { TArray, TObject, TPartial, TUnion } from '@sinclair/typebox';
import { t } from 'elysia';

import { filterByKeyExclusionRecursive } from '#/modules/data/data';
import { createFiltersSchema } from './create-filters-schema';

/**
 * Creates a count schema for counting records with optional filtering.
 *
 * @template TSourceSchema - The TypeBox object schema to create count capabilities for
 *
 * @param schema - The base object schema to create count schema for.
 *
 * @returns A TypeBox partial object schema containing queryOptions with filters for counting operations
 */
export const createCountSchema = <
	const TSourceSchema extends TObject
>(schema: TSourceSchema): TPartial<TObject<{
	queryOptions: TPartial<TObject<{
		filters: TUnion<[
			TPartial<ReturnType<typeof createFiltersSchema<TSourceSchema>>>,
			TArray<TPartial<ReturnType<typeof createFiltersSchema<TSourceSchema>>>>
		]>;
	}>>
}>> => {
	const sanitizedSchema = filterByKeyExclusionRecursive(
		schema,
		[
			'minLength',
			'maxLength',
			'pattern',
			'minimum',
			'maximum',
			'exclusiveMinimum',
			'exclusiveMaximum',
			'multipleOf',
			'minItems',
			'maxItems',
			'maxContains',
			'minContains',
			'minProperties',
			'maxProperties',
			'uniqueItems',
			'minimumTimestamp',
			'maximumTimestamp',
			'exclusiveMinimumTimestamp',
			'exclusiveMaximumTimestamp',
			'multipleOfTimestamp',
			'required',
			'examples',
			'example',
			'default',
			'title',
			'description'
		]
	) as TSourceSchema;

	return t.Partial(t.Object({
		queryOptions: t.Partial(t.Object({
			filters: t.Union([
				t.Partial(createFiltersSchema(sanitizedSchema)),
				t.Array(t.Partial(createFiltersSchema(sanitizedSchema)))
			])
		}))
	}));
};
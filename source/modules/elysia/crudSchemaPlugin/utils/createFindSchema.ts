import type { TArray, TNumber, TObject, TPartial, TUnion } from '@sinclair/typebox';
import { t } from 'elysia';

import { filterByKeyExclusionRecursive } from '#/modules/data/data';
import { createFiltersSchema } from './createFiltersSchema';
import { createOrderSchema } from './createOrderSchema';
import { createSelectedFieldsSchema } from './createSelectedFieldsSchema';

/**
 * Creates a find schema.
 *
 * @template TSourceSchema - The TypeBox object schema to create search capabilities for. Extends {@link TObject}
 *
 * @param schema - The base object schema to create search schemas for.
 *
 * @returns A TypeBox object schema for search with selected fields, order by, filters, limit, and offset
 */
export const createFindSchema = <TSourceSchema extends TObject>(schema: TSourceSchema): TPartial<TObject<{
	queryOptions: TPartial<TObject<{
		selectedFields: ReturnType<typeof createSelectedFieldsSchema>;
		orderBy: ReturnType<typeof createOrderSchema>;
		filters: TUnion<[
			TPartial<ReturnType<typeof createFiltersSchema<TSourceSchema>>>,
			TArray<TPartial<ReturnType<typeof createFiltersSchema<TSourceSchema>>>>
		]>;
		limit: TNumber;
		offset: TNumber;
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
			selectedFields: createSelectedFieldsSchema(sanitizedSchema),
			orderBy: createOrderSchema(sanitizedSchema),
			filters: t.Union([
				t.Partial(createFiltersSchema(sanitizedSchema)),
				t.Array(t.Partial(createFiltersSchema(sanitizedSchema)))
			]),
			limit: t.Number({
				description: 'Maximum number of results to return',
				default: 100,
				minimum: 1
			}),
			offset: t.Number({
				description: 'Number of results to skip before starting to collect the result set',
				default: 0,
				minimum: 0
			})
		}))
	}));
};
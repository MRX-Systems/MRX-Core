import type { TArray, TObject, TOptional, TPartial, TUnion } from '@sinclair/typebox';
import { t } from 'elysia';

import { filterByKeyExclusionRecursive } from '#/modules/data/data';
import { createFiltersSchema } from './create-filters-schema';
import { createSelectedFieldsSchema } from './create-selected-fields-schema';

/**
 * Creates a delete schema for deleting records with optional selected fields and required filtering.
 *
 * @template TSourceSchema - The TypeBox object schema to create delete capabilities for
 *
 * @param schema - The base object schema to create delete schema for.
 *
 * @returns A TypeBox object schema containing queryOptions with selected fields and filters for delete operations
 */
export const createDeleteSchema = <TSourceSchema extends TObject>(schema: TSourceSchema): TObject<{
	queryOptions: TObject<{
		selectedFields: TOptional<ReturnType<typeof createSelectedFieldsSchema>>;
		filters: TUnion<[
			TPartial<ReturnType<typeof createFiltersSchema<TSourceSchema>>>,
			TArray<TPartial<ReturnType<typeof createFiltersSchema<TSourceSchema>>>>
		]>;
	}>
}> => {
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

	return t.Object({
		queryOptions: t.Object({
			selectedFields: t.Optional(createSelectedFieldsSchema(sanitizedSchema)),
			filters: t.Union([
				t.Partial(createFiltersSchema(sanitizedSchema)),
				t.Array(t.Partial(createFiltersSchema(sanitizedSchema)), { minItems: 1 })
			])
		})
	});
};
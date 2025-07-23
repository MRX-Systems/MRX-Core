import type { TArray, TObject, TPartial, TUnion, TOptional } from '@sinclair/typebox';
import { t } from 'elysia';

import { filterByKeyExclusionRecursive } from '#/modules/data/data';
import { createFiltersSchema } from './createFiltersSchema';
import { createSelectedFieldsSchema } from './createSelectedFieldsSchema';

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
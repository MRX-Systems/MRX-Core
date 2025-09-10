import type { TObject } from '@sinclair/typebox/type';
import { t } from 'elysia';

import { filterByKeyExclusionRecursive } from '#/modules/data/data';
import type { UpdateSchema } from '#/modules/elysia/crud/types/update-schema';
import { createSelectedFieldsSchema } from '#/modules/elysia/crud/utils/create-selected-fields-schema';
import { createFiltersSchema } from './create-filters-schema';

export const createUpdateSchema = <TSourceUpdateSchema extends TObject>(schema: TSourceUpdateSchema): UpdateSchema<TSourceUpdateSchema> => {
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
	) as TSourceUpdateSchema;

	schema.minProperties = 1;

	return t.Object({
		queryOptions: t.Object({
			selectedFields: t.Optional(createSelectedFieldsSchema(sanitizedSchema)),
			filters: t.Union([
				t.Partial(createFiltersSchema(sanitizedSchema)),
				t.Array(t.Partial(createFiltersSchema(sanitizedSchema)), { minItems: 1 })
			])
		}),
		data: t.Partial(schema)
	});
};
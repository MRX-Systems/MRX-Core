import type { TObject } from '@sinclair/typebox/type';
import { t } from 'elysia';

import { filterByKeyExclusionRecursive } from '#/modules/data/data';
import type { FindSchema } from '#/modules/elysia/crud/types/find-schema';
import { createFiltersSchema } from '#/modules/elysia/crud/utils/create-filters-schema';
import { createSelectedFieldsSchema } from '#/modules/elysia/crud/utils/create-selected-fields-schema';
import { createOrderSchema } from './create-order-schema';

/**
 * Creates a find schema.
 *
 * @template TSourceSchema - The TypeBox object schema to create search capabilities for.
 *
 * @param schema - The base object schema to create search schemas for.
 *
 * @returns A TypeBox object schema for search with selected fields, order by, filters, limit, and offset
 */
export const createFindSchema = <TSourceFindSchema extends TObject>(schema: TSourceFindSchema): FindSchema<TSourceFindSchema> => {
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
	) as TSourceFindSchema;

	return t.Partial(t.Object({
		queryOptions: t.Partial(t.Object({
			selectedFields: createSelectedFieldsSchema(sanitizedSchema),
			orderBy: createOrderSchema(sanitizedSchema),
			filters: t.Union([
				t.Partial(createFiltersSchema(sanitizedSchema)),
				t.Array(t.Partial(createFiltersSchema(sanitizedSchema)))
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
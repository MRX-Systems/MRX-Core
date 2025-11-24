import type { TObject } from '@sinclair/typebox/type';
import { t } from 'elysia';

import { createSelectedFieldsSchema } from '#/modules/elysia/crud/utils/create-selected-fields-schema';
import type { InsertSchema } from '../types';

export const createInsertSchema = <TSourceInsertSchema extends TObject>(schema: TSourceInsertSchema): InsertSchema<TSourceInsertSchema> => t.Object({
	queryOptions: t.Optional(t.Object({
		selectedFields: createSelectedFieldsSchema(schema)
	})),
	data: t.Union([
		schema,
		t.Array(schema, {
			minItems: 1,
			uniqueItems: true
		})
	])
});
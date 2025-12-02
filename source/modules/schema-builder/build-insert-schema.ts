import type { TObject } from '@sinclair/typebox/type';
import { t } from 'elysia';

import { buildSelectedFieldsSchema } from './build-selected-fields';
import type { InsertSchema } from './types/insert-schema';

export const buildInsertSchema = <TSourceInsertSchema extends TObject>(schema: TSourceInsertSchema): InsertSchema<TSourceInsertSchema> => t.Object({
	queryOptions: t.Optional(t.Object({
		selectedFields: buildSelectedFieldsSchema(schema)
	})),
	data: t.Union([
		schema,
		t.Array(schema, {
			minItems: 1,
			uniqueItems: true
		})
	])
});
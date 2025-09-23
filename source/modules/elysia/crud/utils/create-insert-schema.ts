import type { TArray, TObject, TOptional, TUnion } from '@sinclair/typebox/type';
import { t } from 'elysia';

import type { SelectedFieldsSchema } from '#/modules/elysia/crud/types/selected-field-schema';
import { createSelectedFieldsSchema } from '#/modules/elysia/crud/utils/create-selected-fields-schema';

export const createInsertSchema = <TSourceInsertSchema extends TObject>(schema: TSourceInsertSchema): TObject<{
	queryOptions: TOptional<TObject<{
		selectedFields: SelectedFieldsSchema<TSourceInsertSchema>;
	}>>,
	data: TUnion<[
		TSourceInsertSchema,
		TArray<TSourceInsertSchema>
	]>
}> => t.Object({
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
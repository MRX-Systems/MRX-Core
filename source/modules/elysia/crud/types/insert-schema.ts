import type { TArray, TObject, TOptional, TUnion } from '@sinclair/typebox/type';

import type { SelectedFieldsSchema } from '#/modules/elysia/crud/types/selected-field-schema';

export type InsertSchema<TSourceInsertSchema extends TObject> = TObject<{
	queryOptions: TOptional<TObject<{
		selectedFields: SelectedFieldsSchema<TSourceInsertSchema>;
	}>>,
	data: TUnion<[
		TSourceInsertSchema,
		TArray<TSourceInsertSchema>
	]>
}>;
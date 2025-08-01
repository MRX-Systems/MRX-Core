import type { TArray, TObject, TOptional, TUnion } from '@sinclair/typebox/type';
import { t } from 'elysia';

import { createSelectedFieldsSchema } from './createSelectedFieldsSchema';

export const createInsertSchema = <TSourceSchema extends TObject>(schema: TSourceSchema): TObject<{
	queryOptions: TOptional<TObject<{
		selectedFields: ReturnType<typeof createSelectedFieldsSchema>;
	}>>,
	data: TUnion<[
		TSourceSchema,
		TArray<TSourceSchema>
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
import type { TArray, TObject, TOptional, TPartial, TUnion } from '@sinclair/typebox/type';

import type { FiltersSchema } from '#/modules/elysia/crud/types/filter-schema';
import type { SelectedFieldsSchema } from '#/modules/elysia/crud/types/selected-field-schema';

export type DeleteSchema<TSourceDeleteSchema extends TObject> = TObject<{
	queryOptions: TObject<{
		selectedFields: TOptional<SelectedFieldsSchema<TSourceDeleteSchema>>;
		filters: TUnion<[
			TPartial<FiltersSchema<TSourceDeleteSchema>>,
			TArray<TPartial<FiltersSchema<TSourceDeleteSchema>>>
		]>;
	}>
}>;
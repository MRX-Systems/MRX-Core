import type { TArray, TObject, TOptional, TPartial, TUnion } from '@sinclair/typebox/type';

import type { FiltersSchema } from '#/modules/elysia/crud/types/filter-schema';
import type { SelectedFieldsSchema } from '#/modules/elysia/crud/types/selected-field-schema';

export type UpdateSchema<TSourceUpdateSchema extends TObject> = TObject<{
	queryOptions: TObject<{
		selectedFields: TOptional<SelectedFieldsSchema<TSourceUpdateSchema>>;
		filters: TUnion<[
			TPartial<FiltersSchema<TSourceUpdateSchema>>,
			TArray<TPartial<FiltersSchema<TSourceUpdateSchema>>>
		]>;
	}>,
	data: TPartial<TSourceUpdateSchema>
}>;
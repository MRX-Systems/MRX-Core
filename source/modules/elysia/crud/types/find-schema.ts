import type { TArray, TNumber, TObject, TPartial, TUnion } from '@sinclair/typebox/type';

import type { FiltersSchema } from '#/modules/elysia/crud/types/filter-schema';
import type { OrderSchema } from '#/modules/elysia/crud/types/order-schema';
import type { SelectedFieldsSchema } from '#/modules/elysia/crud/types/selected-field-schema';

export type FindSchema<TSourceFindSchema extends TObject> = TPartial<TObject<{
	queryOptions: TPartial<TObject<{
		selectedFields: SelectedFieldsSchema<TSourceFindSchema>;
		orderBy: OrderSchema<TSourceFindSchema>;
		filters: TUnion<[
			TPartial<FiltersSchema<TSourceFindSchema>>,
			TArray<TPartial<FiltersSchema<TSourceFindSchema>>>
		]>;
		limit: TNumber;
		offset: TNumber;
	}>>
}>>;
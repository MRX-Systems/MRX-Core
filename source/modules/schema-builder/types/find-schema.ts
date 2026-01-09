import type { TArray, TNumber, TObject, TPartial, TUnion } from '@sinclair/typebox/type';

import type { FilterSchema } from './filter-schema';
import type { OrderBySchema } from './order-by-schema';
import type { SelectedFieldsSchema } from './selected-fields-schema';

export type FindSchema<TSourceFindSchema extends TObject> = TPartial<TObject<{
	queryOptions: TPartial<TObject<{
		selectedFields: SelectedFieldsSchema<TSourceFindSchema>;
		orderBy: OrderBySchema<TSourceFindSchema>;
		filters: TUnion<[
			FilterSchema<TSourceFindSchema>,
			TArray<FilterSchema<TSourceFindSchema>>
		]>;
		limit: TNumber;
		offset: TNumber;
	}>>
}>>;
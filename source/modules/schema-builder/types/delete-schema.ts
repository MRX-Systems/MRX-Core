import type { TArray, TObject, TOptional, TUnion } from '@sinclair/typebox/type';

import type { FilterSchema } from './filter-schema';
import type { SelectedFieldsSchema } from './selected-fields-schema';

export type DeleteSchema<TSourceDeleteSchema extends TObject> = TObject<{
	queryOptions: TObject<{
		selectedFields: TOptional<SelectedFieldsSchema<TSourceDeleteSchema>>;
		filters: TUnion<[
			FilterSchema<TSourceDeleteSchema>,
			TArray<FilterSchema<TSourceDeleteSchema>>
		]>;
	}>
}>;
import type { TArray, TObject, TOptional, TPartial, TUnion } from '@sinclair/typebox/type';

import type { FilterSchema } from './filter-schema';
import type { SelectedFieldsSchema } from './selected-fields-schema';

export type UpdateSchema<TSourceUpdateSchema extends TObject> = TObject<{
	queryOptions: TObject<{
		selectedFields: TOptional<SelectedFieldsSchema<TSourceUpdateSchema>>;
		filters: TUnion<[
			FilterSchema<TSourceUpdateSchema>,
			TArray<FilterSchema<TSourceUpdateSchema>>
		]>;
	}>,
	data: TPartial<TSourceUpdateSchema>
}>;
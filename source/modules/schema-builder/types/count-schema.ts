import type { TArray, TObject, TPartial, TUnion } from '@sinclair/typebox/type';

import type { FilterSchema } from './filter-schema';

export type CountSchema<TSourceCountSchema extends TObject> = TPartial<TObject<{
	queryOptions: TPartial<TObject<{
		filters: TUnion<[
			FilterSchema<TSourceCountSchema>,
			TArray<FilterSchema<TSourceCountSchema>>
		]>
	}>>
}>>;
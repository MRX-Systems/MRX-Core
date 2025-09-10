import type { TArray, TObject, TPartial, TUnion } from '@sinclair/typebox/type';

import type { FiltersSchema } from './filter-schema';

export type CountSchema<TSourceCountSchema extends TObject> = TPartial<TObject<{
	queryOptions: TPartial<TObject<{
		filters: TUnion<[
			TPartial<FiltersSchema<TSourceCountSchema>>,
			TArray<TPartial<FiltersSchema<TSourceCountSchema>>>
		]>;
	}>>
}>>;
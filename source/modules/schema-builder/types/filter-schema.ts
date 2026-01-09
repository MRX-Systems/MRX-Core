import type { Static, TObject, TPartial, TUnion } from '@sinclair/typebox/type';

import type { AdaptiveWhereClauseSchema } from './adaptive-where-clause-schema';
import type { GlobalSearchSchema } from './global-search-schema';
import type { TFlatten } from './tflatten';

export type FilterSchema<TSourceSchema extends TObject> = TPartial<TObject<
	{
		$q: GlobalSearchSchema<TSourceSchema>;
	}
	& {
		[K in keyof Static<TSourceSchema>]: TFlatten<TUnion<[
			TSourceSchema['properties'][K],
			AdaptiveWhereClauseSchema<TSourceSchema['properties'][K]>
		]>>
	}
>>;
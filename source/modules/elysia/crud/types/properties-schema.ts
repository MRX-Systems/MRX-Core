import type { Static, TObject, TUnion } from '@sinclair/typebox/type';

import type { AdaptiveWhereClauseSchema } from './adaptive-where-clause-schema';

export type PropertiesSchema<TSourceSchema extends TObject> = TObject<{
	[K in keyof Static<TSourceSchema>]: TUnion<[
		AdaptiveWhereClauseSchema<TSourceSchema['properties'][K]>,
		TSourceSchema['properties'][K]
	]>
}>;
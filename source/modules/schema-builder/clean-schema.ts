import type { TObject } from '@sinclair/typebox';

import { filterByKeyExclusionRecursive } from '#/modules/data/data';

export const cleanSchema = <TSourceSchema extends TObject>(schema: TSourceSchema): TSourceSchema => filterByKeyExclusionRecursive(
	schema,
	[
		'minLength',
		'maxLength',
		'pattern',
		'minimum',
		'maximum',
		'exclusiveMinimum',
		'exclusiveMaximum',
		'multipleOf',
		'minItems',
		'maxItems',
		'maxContains',
		'minContains',
		'minProperties',
		'maxProperties',
		'uniqueItems',
		'minimumTimestamp',
		'maximumTimestamp',
		'exclusiveMinimumTimestamp',
		'exclusiveMaximumTimestamp',
		'multipleOfTimestamp',
		'required',
		'default'
	]
) as TSourceSchema;
import type { Static, TNull, TObject, TUnion } from '@sinclair/typebox/type';
import { t } from 'elysia';

import { filterByKeyExclusionRecursive } from '#/modules/data/data';
import type { Response200Schema } from '#/modules/elysia/crud/types/response-200-schema';
import type { TFlatten } from '#/shared/types/tflatten';
import { flatten } from '#/shared/utils/flatten';

export const createResponse200Schema = <TSourceResponseSchema extends TObject>(schema: TSourceResponseSchema): Response200Schema<TSourceResponseSchema> => {
	const sanitizedSchema = filterByKeyExclusionRecursive(
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
	) as TSourceResponseSchema;

	const { properties } = sanitizedSchema;

	const responseSchema = {} as {
		[K in keyof Static<TSourceResponseSchema>]: TFlatten<
			TUnion<[
				TSourceResponseSchema['properties'][K],
				TNull
			]>
		>
	};

	for (const key in properties)
	// @ts-expect-error - Generic can't be indexed
		responseSchema[key] = flatten(
			t.Union([properties[key], t.Null()])
		);

	return t.Object({
		message: t.String(),
		content: t.Array(t.Partial(t.Object(responseSchema)))
	});
};
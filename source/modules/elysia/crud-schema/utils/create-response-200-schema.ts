import { TypeGuard } from '@sinclair/typebox';
import type { Static, TArray, TLiteral, TObject, TPartial, TString, TUndefined, TUnion } from '@sinclair/typebox/type';
import { t } from 'elysia';

import { filterByKeyExclusionRecursive } from '#/modules/data/data';

export const createResponse200Schema = <TSourceResponseSchema extends TObject>(schema: TSourceResponseSchema):
TObject<{
	message: TString;
	content: TArray<
		TPartial<
			TObject<{
				[K in keyof Static<TSourceResponseSchema>]: TUnion<[
					TUndefined,
					TLiteral<''>,
					TSourceResponseSchema['properties'][K]
				]>
			}>
		>
	>
}> => {
	const sanitizedSchema = filterByKeyExclusionRecursive(
		schema,
		[
			'minLength',
			'maxLength',
			'pattern',
			'format',
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
		[K in keyof Static<TSourceResponseSchema>]: TUnion<[
			TUndefined,
			TLiteral<''>,
			TSourceResponseSchema['properties'][K]
		]>
	};

	for (const key in properties)
	// @ts-expect-error - Generic can't be indexed
		responseSchema[key] = TypeGuard.IsString(properties[key])
			? t.Union([properties[key], t.Undefined(), t.Literal(''), t.Null()])
			: t.Union([properties[key], t.Undefined(), t.Null()]);

	return t.Object({
		message: t.String(),
		content: t.Array(t.Partial(t.Object(responseSchema)))
	});
};
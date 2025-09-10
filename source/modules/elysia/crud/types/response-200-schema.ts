import type { Static, TArray, TLiteral, TObject, TPartial, TString, TUndefined, TUnion } from '@sinclair/typebox/type';

export type Response200Schema<TSourceResponseSchema extends TObject> = TObject<{
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
}>;
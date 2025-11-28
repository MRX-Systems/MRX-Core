import type { Static, TArray, TNull, TObject, TRequired, TString, TUnion } from '@sinclair/typebox/type';

import type { TFlatten } from '#/shared/types/tflatten';

export type Response200Schema<TSourceResponseSchema extends TObject> = TObject<{
	message: TString;
	content: TArray<
		TRequired<
			TObject<{
				[K in keyof Static<TSourceResponseSchema>]: TFlatten<
					TUnion<[
						TSourceResponseSchema['properties'][K],
						TNull
					]>
				>
			}>
		>
	>
}>;
import type { TArray, TKeyOf, TNumber, TObject, TString, TUnion } from '@sinclair/typebox/type';

export type QSchema<TSourceSchema extends TObject> = TUnion<[
	TObject<{
		selectedFields: TUnion<[
			TKeyOf<TSourceSchema>,
			TArray<TKeyOf<TSourceSchema>>
		]>,
		value: TUnion<[
			TNumber,
			TString
		]>
	}>,
	TNumber,
	TString
]>;
import type { TArray, TKeyOf, TNumber, TObject, TString, TUnion } from '@sinclair/typebox';

export type QSchema<TInferedObject extends TObject> = TUnion<[
	TObject<{
		selectedFields: TUnion<[
			TKeyOf<TInferedObject>,
			TArray<TKeyOf<TInferedObject>>
		]>,
		value: TUnion<[
			TNumber,
			TString
		]>
	}>,
	TNumber,
	TString
]>;
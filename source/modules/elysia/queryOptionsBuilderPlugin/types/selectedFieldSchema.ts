import type { TArray, TKeyOf, TLiteral, TObject, TUnion } from '@sinclair/typebox';

export type SelectedFieldsSchema<TInferedObject extends TObject> = TUnion<[
	TKeyOf<TInferedObject>,
	TLiteral<'*'>,
	TArray<TKeyOf<TInferedObject>>
]>;
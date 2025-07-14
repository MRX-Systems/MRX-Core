import type { TArray, TKeyOf, TLiteral, TObject, TUnion } from '@sinclair/typebox';

export type OrderSchema<TInferedObject extends TObject> = TUnion<[
	TObject<{
		selectedField: TKeyOf<TInferedObject>;
		direction: TUnion<[TLiteral<'asc'>, TLiteral<'desc'>]>;
	}>,
	TArray<TObject<{
		selectedField: TKeyOf<TInferedObject>;
		direction: TUnion<[TLiteral<'asc'>, TLiteral<'desc'>]>
	}>>
]>;
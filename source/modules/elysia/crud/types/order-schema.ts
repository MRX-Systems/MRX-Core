import type { TArray, TKeyOf, TLiteral, TObject, TUnion } from '@sinclair/typebox/type';

export type OrderSchema<TSourceSchema extends TObject> = TUnion<[
	TObject<{
		selectedField: TKeyOf<TSourceSchema>;
		direction: TUnion<[TLiteral<'asc'>, TLiteral<'desc'>]>;
	}>,
	TArray<TObject<{
		selectedField: TKeyOf<TSourceSchema>;
		direction: TUnion<[TLiteral<'asc'>, TLiteral<'desc'>]>
	}>>
]>;
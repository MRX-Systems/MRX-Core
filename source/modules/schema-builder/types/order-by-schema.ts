import type { TKeyOf, TLiteral, TObject, TUnion } from '@sinclair/typebox/type';

export type OrderBySchema<TSourceSchema extends TObject> = TObject<{
	selectedField: TKeyOf<TSourceSchema>;
	direction: TUnion<[TLiteral<'asc'>, TLiteral<'desc'>]>;
}>;
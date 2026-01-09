import type { TSchema, TUnion } from '@sinclair/typebox/type';

type FlattenTuple<T extends readonly TSchema[]>
	= T extends readonly [infer First extends TSchema, ...infer Rest extends TSchema[]]
		? [...TFlattenType<First>, ...FlattenTuple<Rest>]
		: [];

type TFlattenType<Type extends TSchema>
	= Type extends TUnion<infer Types extends TSchema[]>
		? FlattenTuple<Types>
		: [Type];

export type TFlatten<Type extends TSchema>
	= Type extends TUnion<infer Types extends TSchema[]>
		? TUnion<FlattenTuple<Types>>
		: Type;
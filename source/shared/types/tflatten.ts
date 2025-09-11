import type { TSchema, TUnion } from '@sinclair/typebox/type';

export type TFlatten<Type extends TSchema> = Type extends TUnion<infer Types extends TSchema[]>
	? Types extends readonly [infer First extends TSchema, ...infer Rest extends TSchema[]]
		? [...TFlatten<First>, ...TFlatten<TUnion<Rest>>]
		: []
	: [Type];
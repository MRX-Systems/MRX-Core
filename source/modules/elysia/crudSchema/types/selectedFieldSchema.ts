import type {
	TArray,
	TKeyOf,
	TLiteral,
	TObject,
	TUnion
} from '@sinclair/typebox';

export type SelectedFieldsSchema<TSourceSchema extends TObject> = TUnion<[
	TKeyOf<TSourceSchema>,
	TLiteral<'*'>,
	TArray<TKeyOf<TSourceSchema>>
]>;
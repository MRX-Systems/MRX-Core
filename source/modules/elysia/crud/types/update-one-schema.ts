import type { TObject, TPartial } from '@sinclair/typebox/type';

export type UpdateOneSchema<TSourceSchema extends TObject> = TObject<{
	data: TPartial<TSourceSchema>
}>;
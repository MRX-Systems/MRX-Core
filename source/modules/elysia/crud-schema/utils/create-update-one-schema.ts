import type { TObject, TPartial } from '@sinclair/typebox';
import { t } from 'elysia';

export const createUpdateOneSchema = <TSourceSchema extends TObject>(schema: TSourceSchema): TObject<{
	data: TPartial<TSourceSchema>
}> => t.Object({
	data: t.Partial(schema)
});
import type { TObject } from '@sinclair/typebox/type';
import { t } from 'elysia';

import type { UpdateOneSchema } from '#/modules/elysia/crud/types/update-one-schema';

export const createUpdateOneSchema = <TSourceUpdateSchema extends TObject>(schema: TSourceUpdateSchema): UpdateOneSchema<TSourceUpdateSchema> => t.Object({
	data: t.Partial(schema)
});
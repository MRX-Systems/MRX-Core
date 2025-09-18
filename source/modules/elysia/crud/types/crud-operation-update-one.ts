import type { Static, TObject } from '@sinclair/typebox/type';
import type { BaseMacro, InputSchema, LocalHook, SingletonBase } from 'elysia/types';

import type { CrudOperationBase } from './crud-operation-base';
import type { IdParamSchema } from './id-param-schema';
import type { Response200Schema } from './response-200-schema';
import type { UpdateOneSchema } from './update-one-schema';

export interface CrudOperationUpdateOne<
	THeaderSchema extends TObject,
	TSourceUpdateSchema extends TObject,
	TSourceResponseSchema extends TObject
> extends CrudOperationBase {
	readonly hook?: LocalHook<
		InputSchema,
		{
			headers: Static<THeaderSchema>;
			params: Static<IdParamSchema>;
			body: Static<UpdateOneSchema<TSourceUpdateSchema>>;
			response: Static<Response200Schema<TSourceResponseSchema>>;
		},
		SingletonBase,
		Record<string, Error>,
		BaseMacro
	>;
}

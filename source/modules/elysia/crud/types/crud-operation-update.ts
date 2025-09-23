import type { Static, TObject } from '@sinclair/typebox/type';
import type { BaseMacro, LocalHook, SingletonBase } from 'elysia/types';

import type { CrudOperationBase } from './crud-operation-base';
import type { Response200Schema } from './response-200-schema';
import type { UpdateSchema } from './update-schema';

export interface CrudOperationUpdate<
	THeaderSchema extends TObject,
	TSourceUpdateSchema extends TObject,
	TSourceResponseSchema extends TObject
> extends CrudOperationBase {
	readonly hook?: LocalHook<
		BaseMacro,
		{
			headers: Static<THeaderSchema>;
			body: Static<UpdateSchema<TSourceUpdateSchema>>;
			response: Static<Response200Schema<TSourceResponseSchema>>;
			return: Static<Response200Schema<TSourceResponseSchema>>;
			resolve: Record<string, unknown>;
		},
		SingletonBase,
		Record<string, Error>
	>;
}

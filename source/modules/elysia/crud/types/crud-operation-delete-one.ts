import type { Static, TObject } from '@sinclair/typebox/type';
import type { BaseMacro, LocalHook, SingletonBase } from 'elysia/types';

import type { CrudOperationBase } from './crud-operation-base';
import type { IdParamSchema } from './id-param-schema';
import type { Response200Schema } from './response-200-schema';

export interface CrudOperationDeleteOne<
	THeaderSchema extends TObject,
	TSourceResponseSchema extends TObject
> extends CrudOperationBase {
	readonly hook?: LocalHook<
		BaseMacro,
		{
			headers: Static<THeaderSchema>;
			params: Static<IdParamSchema>;
			response: Static<Response200Schema<TSourceResponseSchema>>;
			return: Static<Response200Schema<TSourceResponseSchema>>;
			resolve: Record<string, unknown>;
		},
		SingletonBase,
		Record<string, Error>
	>;
}

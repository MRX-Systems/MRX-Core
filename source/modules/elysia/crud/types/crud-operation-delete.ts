import type { Static, TObject } from '@sinclair/typebox/type';
import type { BaseMacro, LocalHook, SingletonBase } from 'elysia/types';

import type { CrudOperationBase } from './crud-operation-base';
import type { DeleteSchema } from './delete-schema';
import type { Response200Schema } from './response-200-schema';

export interface CrudOperationDelete<
	THeaderSchema extends TObject,
	TSourceDeleteSchema extends TObject,
	TSourceResponseSchema extends TObject
> extends CrudOperationBase {
	readonly hook?: LocalHook<
		BaseMacro,
		{
			headers: Static<THeaderSchema>;
			body: Static<DeleteSchema<TSourceDeleteSchema>>;
			response: Static<Response200Schema<TSourceResponseSchema>>;
			return: Static<Response200Schema<TSourceResponseSchema>>;
			resolve: Record<string, unknown>;
		},
		SingletonBase,
		Record<string, Error>
	>;
}

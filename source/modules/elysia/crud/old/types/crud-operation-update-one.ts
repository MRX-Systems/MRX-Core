import type { Static, TObject } from '@sinclair/typebox/type';
import type { BaseMacro, InputSchema, LocalHook, SingletonBase } from 'elysia/types';

import type { CrudOperationBase } from './crud-operation-base';

export interface CrudOperationUpdateOne<
	THeaderSchema extends TObject,
	TSourceUpdateSchema extends TObject,
	TSourceResponseSchema extends TObject
> extends CrudOperationBase {
	readonly hook?: LocalHook<
		InputSchema,
		{
			headers: Static<THeaderSchema>;
			body: Static<TSourceUpdateSchema>;
			response: Static<TSourceResponseSchema>;
		},
		SingletonBase,
		Record<string, Error>,
		BaseMacro
	>;
}

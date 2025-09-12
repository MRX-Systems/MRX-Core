import type { Static, TObject } from '@sinclair/typebox/type';
import type { BaseMacro, InputSchema, LocalHook, SingletonBase } from 'elysia/types';

import type { CrudOperationBase } from './crud-operation-base';
import type { FindSchema } from './find-schema';
import type { Response200Schema } from './response-200-schema';

export interface CrudOperationFind<
	THeaderSchema extends TObject,
	TSourceFindSchema extends TObject,
	TSourceResponseSchema extends TObject
> extends CrudOperationBase {
	readonly hook?: LocalHook<
		InputSchema,
		{
			headers: Static<THeaderSchema>;
			body: Static<FindSchema<TSourceFindSchema>>;
			response: Static<Response200Schema<TSourceResponseSchema>>;
		},
		SingletonBase,
		Record<string, Error>,
		BaseMacro
	>;
}

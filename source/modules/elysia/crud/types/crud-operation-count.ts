import type { Static, TObject } from '@sinclair/typebox/type';
import type { BaseMacro, InputSchema, LocalHook, SingletonBase } from 'elysia/types';

import type { CountResponse200Schema } from './count-response-200-schema';
import type { CountSchema } from './count-schema';
import type { CrudOperationBase } from './crud-operation-base';

export interface CrudOperationCount<
	THeaderSchema extends TObject,
	TSourceCountSchema extends TObject
> extends CrudOperationBase {
	readonly hook?: LocalHook<
		InputSchema,
		{
			headers: Static<THeaderSchema>;
			body: Static<CountSchema<TSourceCountSchema>>;
			response: Static<CountResponse200Schema>;
		},
		SingletonBase,
		Record<string, Error>,
		BaseMacro
	>;
}

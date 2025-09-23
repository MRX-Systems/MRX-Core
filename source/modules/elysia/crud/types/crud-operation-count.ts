import type { Static, TObject } from '@sinclair/typebox/type';
import type { BaseMacro, LocalHook, SingletonBase } from 'elysia/types';

import type { CountResponse200Schema } from './count-response-200-schema';
import type { CountSchema } from './count-schema';
import type { CrudOperationBase } from './crud-operation-base';

export interface CrudOperationCount<
	THeaderSchema extends TObject,
	TSourceCountSchema extends TObject
> extends CrudOperationBase {
	readonly hook?: LocalHook<
		BaseMacro,
		{
			headers: Static<THeaderSchema>;
			body: Static<CountSchema<TSourceCountSchema>>;
			response: Static<CountResponse200Schema>;
			return: Static<CountResponse200Schema>;
			resolve: Record<string, unknown>;
		},
		SingletonBase,
		Record<string, Error>
	>;
}

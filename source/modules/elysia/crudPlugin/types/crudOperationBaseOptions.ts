import type { Static, TObject } from '@sinclair/typebox/type';
import type { BaseMacro, InputSchema, LocalHook, RouteSchema, SingletonBase } from 'elysia/types';

export interface CrudOperationBaseOptions<TInferedObject extends TObject> {
	readonly path?: string;
	readonly method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
	readonly hook?: LocalHook<
		InputSchema,
		RouteSchema,
		SingletonBase,
		Record<string, Error>,
		BaseMacro
	>;
	transform?: (data: Static<TInferedObject>) => TInferedObject;
	// transformAfterValidation?: (data: Static<TInferedObject>) => TInferedObject;
}

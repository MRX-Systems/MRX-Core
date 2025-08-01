import type { BaseMacro, InputSchema, LocalHook, RouteSchema, SingletonBase } from 'elysia/types';

export interface CrudOperationBaseOptions {
	readonly path?: string;
	readonly method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
	readonly hook?: LocalHook<
		InputSchema,
		RouteSchema,
		SingletonBase,
		Record<string, Error>,
		BaseMacro
	>;
}

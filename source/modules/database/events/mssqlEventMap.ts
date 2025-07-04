import type { QueryContext } from '#/modules/database/types/queryContext';

export interface MssqlEventMap {
	readonly query: [QueryContext]
	readonly 'query:response': [unknown[], QueryContext]
	readonly 'query:error': [Error, QueryContext]
}
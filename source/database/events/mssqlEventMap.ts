import type { QueryContext } from '#/database/types/queryContext';

export interface MssqlEventMap {
    query: [QueryContext]
    'query:response': [unknown[], QueryContext]
    'query:error': [Error, QueryContext]
}
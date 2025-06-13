import type { QueryContext } from '#/modules/database/types/queryContext';

export interface MssqlEventMap {
    query: [QueryContext]
    'query:response': [unknown[], QueryContext]
    'query:error': [Error, QueryContext]
}
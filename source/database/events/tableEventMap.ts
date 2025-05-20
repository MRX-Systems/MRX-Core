import type { QueryContext } from '#/database/types/queryContext';

export interface TableEventMap {
    selected: [unknown, QueryContext]
    inserted: [unknown, QueryContext]
    updated: [unknown, QueryContext]
    deleted: [unknown, QueryContext]
}
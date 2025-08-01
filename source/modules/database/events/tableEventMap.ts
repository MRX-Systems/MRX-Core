import type { QueryContext } from '#/modules/database/types/queryContext';

export interface TableEventMap {
	readonly selected: [unknown, QueryContext]
	readonly inserted: [unknown, QueryContext]
	readonly updated: [unknown, QueryContext]
	readonly deleted: [unknown, QueryContext]
}
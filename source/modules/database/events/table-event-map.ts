import type { QueryContext } from '#/modules/database/types/query-context';

export interface TableEventMap {
	readonly selected: [unknown, QueryContext]
	readonly inserted: [unknown, QueryContext]
	readonly updated: [unknown, QueryContext]
	readonly deleted: [unknown, QueryContext]
}
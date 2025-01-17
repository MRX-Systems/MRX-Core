import type { QueryOptions } from './queryOptions';

/**
 * Interface Option query with pagination inherited from {@link QueryOptions}
 *
 * @typeParam T - The type of the object to retrieve.
 */
export interface QueryOptionsExtendPagination<T> extends QueryOptions<T> {
    /**
     * The limit of the query (default: 100)
     */
    limit?: number;

    /**
     * The offset of the query (default: 0)
     */
    offset?: number;
}
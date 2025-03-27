import type { QueryOptions } from './queryOptions';

/**
 * Interface Option query with pagination inherited from {@link QueryOptions}
 *
 * @template TModel - The type of the object to retrieve.
 */
export interface QueryOptionsExtendPagination<TModel> extends QueryOptions<TModel> {
    /**
     * The limit of the query (default: 100)
     */
    limit?: number;

    /**
     * The offset of the query (default: 0)
     */
    offset?: number;
}
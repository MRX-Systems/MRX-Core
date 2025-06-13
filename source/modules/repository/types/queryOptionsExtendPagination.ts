import type { QueryOptions } from './queryOptions';

/**
 * Extends {@link QueryOptions} to add pagination capabilities for queries.
 *
 * @template TModel - The type of the object to retrieve.
 *
 * This interface allows specifying pagination options such as limit and offset
 * in addition to the base query options.
 */
export interface QueryOptionsExtendPagination<TModel> extends QueryOptions<TModel> {
    /**
     * The limit of the query
     * @defaultValue 100
     */
    limit?: number;

    /**
     * The offset of the query
     * @defaultValue 0
     */
    offset?: number;
}
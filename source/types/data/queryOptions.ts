import type { AdvancedSearch } from './advancedSearch';
import type { FieldSelection } from './fieldSelection';
import type { Transaction } from './transaction';

/**
 * This interface defines the basic options for a repository query.
 *
 * @typeParam T - The type of the object to retrieve.
 */
export interface QueryOptions<T> {
    /**
     * The advanced search options to apply to the query. Can be a single object or an array of objects. ({@link AdvancedSearch})
     */
    advancedSearch?: AdvancedSearch<NoInfer<T>> | AdvancedSearch<T>[];
    /**
     * The fields to select in the query. If not provided, all fields are selected. ({@link FieldSelection})
     */
    selectedFields?: FieldSelection<NoInfer<T>>
    /**
     * Order the results by a specific column and direction.
     */
    orderBy?: [
        Extract<keyof NoInfer<T>, string>,
        'asc' | 'desc'
    ];
    /**
     * If the query does not return any result, throw an error or not. (default: false)
     */
    throwIfNoResult?: boolean;
    /**
     * If the query is a transaction ({@link Transaction})
     */
    transaction?: Transaction;
}
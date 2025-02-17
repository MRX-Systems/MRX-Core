import type { AdvancedSearch } from './advancedSearch';
import type { OrderBy } from './orderBy';
import type { SelectedFields } from './selectedFields';
import type { Transaction } from './transaction';

/**
 * This interface defines the basic options for a repository query.
 *
 * @typeParam TModel - The type of the object to retrieve.
 */
export interface QueryOptions<TModel> {
    /**
     * The advanced search options to apply to the query. Can be a single object or an array of objects. ({@link AdvancedSearch})
     */
    advancedSearch?: AdvancedSearch<NoInfer<TModel>> | AdvancedSearch<NoInfer<TModel>>[];
    /**
     * The fields to select in the query. If not provided, all fields are selected. ({@link SelectedFields})
     */
    selectedFields?: SelectedFields<NoInfer<TModel>>;
    /**
     * Order the results by a specific column and direction. ({@link OrderBy})
     */
    orderBy?: OrderBy<NoInfer<TModel>>;
    /**
     * If the query does not return any result, throw an error or not. (default: false)
     */
    throwIfNoResult?: boolean;
    /**
     * If the query is a transaction ({@link Transaction})
     */
    transaction?: Transaction;
}
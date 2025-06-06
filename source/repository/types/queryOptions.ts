import type { Filter } from './filter';
import type { OrderBy } from './orderBy';
import type { SelectedFields } from './selectedFields';
import type { Transaction } from './transaction';

/**
 * This interface defines the basic options for a repository query.
 *
 * @template TModel - The type of the object to retrieve.
 */
export interface QueryOptions<TModel> {
    /**
     * The filter options to apply to the query. Can be a single object or an array of objects.
     * @see {@link Filter}
     */
    filter?: Filter<NoInfer<TModel>> | Filter<NoInfer<TModel>>[];
    /**
     * The fields to select in the query. If not provided, all fields are selected. ({@link SelectedFields})
     */
    selectedFields?: SelectedFields<NoInfer<TModel>>;
    /**
     * Order the results by a specific column and direction. ({@link OrderBy})
     */
    orderBy?: OrderBy<NoInfer<TModel>>;
    /**
     * Whether to throw an error if the query does not return any result.
     * @defaultValue false
     */
    throwIfNoResult?: boolean;
    /**
     * The transaction context for the query. ({@link Transaction})
     */
    transaction?: Transaction;
}
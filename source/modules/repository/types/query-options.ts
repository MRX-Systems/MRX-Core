import type { HTTP_STATUS_CODES } from '#/errors/enums/http-status-codes';
import type { Filter } from './filter';
import type { OrderBy } from './order-by';
import type { SelectedFields } from './selected-fields';
import type { Transaction } from './transaction';

/**
 * This interface defines the basic options for a repository query.
 *
 * @template TModel - The type of the object to retrieve.
*/
export interface QueryOptions<TModel> {
	/**
	 * The fields to select in the query. If not provided, all fields are selected.
	 *
	 * @defaultValue If not provided, all fields are selected.
	 */
	readonly selectedFields?: SelectedFields<NoInfer<TModel>>
	/**
	 * The filters options to apply to the query. Can be a single object or an array of objects.
	 */
	readonly filters?: Filter<NoInfer<TModel>> | Filter<NoInfer<TModel>>[];
	/**
	 * Order the results by a specific column and direction.
	 * @defaultValue If not provided, the primary key of the model is used in ascending order.
	 */
	readonly orderBy?: OrderBy<NoInfer<TModel>> | OrderBy<NoInfer<TModel>>[];
	/**
	 * Whether to throw an error if the query does not return any result.
	 * @defaultValue false
	 */
	readonly throwIfNoResult?: boolean | {
		message?: string;
		httpStatusCode?: keyof typeof HTTP_STATUS_CODES | typeof HTTP_STATUS_CODES[keyof typeof HTTP_STATUS_CODES];
	};
	/**
	 * The transaction context for the query. ({@link Transaction})
	 */
	readonly transaction?: Transaction;
}
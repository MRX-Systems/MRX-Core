import type { Knex } from 'knex';
import { PassThrough } from 'stream';

import { HttpError } from '#/errors/httpError';
import { DATABASE_ERROR_KEYS } from '#/modules/database/enums/databaseErrorKeys';
import { MSSQL_ERROR_CODE } from '#/modules/database/enums/mssqlErrorCode';
import type { Table } from '#/modules/database/table';
import { isDateString } from '#/utils/isDateString';
import { makeStreamAsyncIterable } from '#/utils/stream';
import type { StreamWithAsyncIterable } from '#/utils/types/streamWithAsyncIterable';
import type { AdaptiveWhereClause } from './types/adaptiveWhereClause';
import type { Filter } from './types/filter';
import type { OrderByItem } from './types/orderByItem';
import type { QueryOptions } from './types/queryOptions';
import type { QueryOptionsExtendPagination } from './types/queryOptionsExtendPagination';
import type { QueryOptionsExtendStream } from './types/queryOptionsExtendStream';

type OperatorFn = (
	query: Knex.QueryBuilder,
	column: string,
	value: unknown
) => Knex.QueryBuilder;

const _operators: Record<string, OperatorFn> = ({
	$eq: (q, c, v) => q.where(c, v as string | number | boolean | Date),
	$neq: (q, c, v) => q.whereNot(c, v as string | number | boolean | Date),
	$lt: (q, c, v) => q.where(c, '<', v as string | number | Date),
	$lte: (q, c, v) => q.where(c, '<=', v as string | number | Date),
	$gt: (q, c, v) => q.where(c, '>', v as string | number | Date),
	$gte: (q, c, v) => q.where(c, '>=', v as string | number | Date),
	$in: (q, c, v) => q.whereIn(c, v as string[] | number[] | Date[]),
	$nin: (q, c, v) => q.whereNotIn(c, v as string[] | number[] | Date[]),
	$between: (q, c, v) => q.whereBetween(c, v as [string | number | Date, string | number | Date]),
	$nbetween: (q, c, v) => q.whereNotBetween(c, v as [string | number | Date, string | number | Date]),
	$like: (q, c, v) => {
		const likeValue = `%${v}%`;
		if (isDateString(v))
			return q.whereRaw(`CONVERT(VARCHAR, ${c}, 23) LIKE ?`, [likeValue]);
		return q.whereLike(c, likeValue);
	},
	$nlike: (q, c, v) => {
		const likeValue = `%${v}%`;
		if (isDateString(v))
			return q.whereRaw(`CONVERT(VARCHAR, ${c}, 23) NOT LIKE ?`, [likeValue]);
		return q.whereRaw(`${c} NOT LIKE ?`, [likeValue]);
	},
	$isNull: (q, c, v) => (v ? q.whereNull(c) : q.whereNotNull(c))
});

/**
 * Valid operator keys for complex query detection.
 * Using a Set for O(1) lookup performance.
 */
const _validOperatorKeys = new Set<string>([
	'$eq',
	'$neq',
	'$lt',
	'$lte',
	'$gt',
	'$gte',
	'$in',
	'$nin',
	'$between',
	'$nbetween',
	'$like',
	'$nlike',
	'$isNull'
]);

/**
 * Default pagination constants.
 */
const _DEFAULT_LIMIT = 100;
const _DEFAULT_OFFSET = 0;

/**
 * Repository allowing interaction with a database table using Knex.js fully typed.
 *
 * @template TModel - The data model type handled by the repository.
 *
 * Example:
 * ```ts
 * const repo = new Repository<User>(knex, userTable);
 * const users = await repo.find({ limit: 10 });
 * ```
 */
export class Repository<TModel = unknown> {
	/**
	 * The Knex instance used for database operations.
	 */
	protected readonly _knex: Knex;

	/**
	 * The table associated with this repository.
	 */
	protected readonly _table: Table;

	/**
	 * Creates a new `Repository` instance with the specified Knex.js instance and table object.
	 *
	 * @param knex - The Knex.js instance used to interact with the database.
	 * @param table - The table object representing the database table to interact with.
	 */
	public constructor(knex: Knex, table: Table) {
		this._knex = knex;
		this._table = table;
	}

	/**
	 * Finds records in the database based on the specified query options and returns a stream
	 * for async iteration. This method is particularly useful when working with large datasets
	 * that would be inefficient to load entirely into memory.
	 *
	 * The stream emits data events for each record and an end event when the stream is finished.
	 * It can be consumed using either async iteration or event listeners.
	 *
	 * @template KModel - The type of the object to retrieve.
	 *
	 * @param options - The query options to apply to the search.
	 *
	 * @returns A stream with an async iterable interface for consuming the results.
	 *
	 * @example
	 * Basic usage with async iteration
	 * ```ts
	 * const stream = userRepository.findStream();
	 * for await (const user of stream) {
	 *     console.log(user);
	 * }
	 * ```
	 * @example
	 * With single field selection
	 * ```ts
	 * const stream = userRepository.findStream({
	 *    selectedFields: 'name'
	 * });
	 * ```
	 * @example
	 * With multiple fields selection
	 * ```ts
	 * const stream = userRepository.findStream({
	 *    selectedFields: ['id', 'name', 'email']
	 * });
	 * ```
	 * @example
	 * With single order by field
	 * ```ts
	 * const stream = userRepository.findStream({
	 *     orderBy: {
	 *         selectedField: 'createdAt',
	 *         direction: 'desc'
	 *     }
	 * });
	 * ```
	 * @example
	 * With multiple order by fields
	 * ```ts
	 * const stream = userRepository.findStream({
	 *     orderBy: [
	 *         { selectedField: 'createdAt', direction: 'desc' },
	 *         { selectedField: 'name', direction: 'asc' }
	 *     ]
	 * });
	 * ```
	 * @example
	 * With filtering
	 * ```ts
	 * const stream = userRepository.findStream({
	 *     filters: {
	 *         isActive: false
	 *     }
	 * });
	 * ```
	 * @example
	 * Using event listeners
	 * ```ts
	 * const stream = userRepository.findStream();
	 * stream.on('data', (user) => {
	 *     console.log('User:', user);
	 * });
	 * stream.on('error', (error) => {
	 *     console.error('Stream error:', error);
	 * });
	 * stream.on('end', () => {
	 *     console.log('Stream completed');
	 * });
	 * ```
	 * @example
	 * With transform function to process records
	 * ```ts
	 * const stream = userRepository.findStream({
	 *     transform: (chunk, encoding, callback) => {
	 *         // Transform the data
	 *         const transformedData = { ...chunk, processed: true };
	 *         callback(null, transformedData);
	 *     }
	 * });
	 * ```
	 * @example
	 * With timeout and custom buffer size for large datasets
	 * ```ts
	 * const stream = userRepository.findStream({
	 *     timeout: 30000, // 30 seconds timeout (default is 5 minutes)
	 *     highWaterMark: 64, // Larger buffer for better throughput
	 *     filters: { isActive: true }
	 * });
	 * ```
	 * @example
	 * Disable timeout for long-running streams
	 * ```ts
	 * const stream = userRepository.findStream({
	 *     timeout: 0, // No timeout - use with caution!
	 *     filters: { department: 'analytics' }
	 * });
	 * ```
	 */
	public findStream<KModel extends TModel = NoInfer<TModel>>(
		options?: QueryOptionsExtendStream<KModel>
	): StreamWithAsyncIterable<KModel> {
		const query = this._knex(this._table.name);

		this._applyQueryOptions<KModel>(query, options);

		const kStream: StreamWithAsyncIterable<KModel> = query.stream();

		const passThrough = new PassThrough({
			objectMode: true,
			...options?.transform && { transform: options.transform }
		});

		// Cleanup function to properly destroy streams and clear resources
		const cleanup = (): void => {
			if (!kStream.destroyed)
				kStream.destroy();
			if (!passThrough.destroyed)
				passThrough.destroy();
		};

		// Handle source stream errors
		kStream.on('error', (error: unknown) => {
			const code = (error as { number: keyof typeof MSSQL_ERROR_CODE })?.number || 0;
			passThrough.emit('error', new HttpError({
				message: MSSQL_ERROR_CODE[code] ?? DATABASE_ERROR_KEYS.MSSQL_QUERY_ERROR,
				cause: {
					query: query.toSQL().sql,
					error
				}
			}));
		});

		// Handle passThrough close - cleanup source stream
		passThrough.on('close', cleanup);

		// Handle passThrough errors - cleanup
		passThrough.on('error', cleanup);

		kStream.pipe(passThrough);
		return makeStreamAsyncIterable<KModel, PassThrough>(passThrough) as StreamWithAsyncIterable<KModel>;
	}

	/**
	 * Finds records in the database based on the specified query options and returns the results
	 * as an array. This method supports comprehensive filtering, pagination, field selection, and sorting
	 * to provide flexible data retrieval capabilities.
	 *
	 * @template KModel - The type of the object to retrieve.
	 *
	 * @param options - The query options to apply to the search.
	 *
	 * @throws ({@link HttpError}) Throws an error if no records are found if the {@link QueryOptions.throwIfNoResult} option is enabled.
	 * @throws ({@link HttpError}) Throws an error if an MSSQL-specific error occurs during the query execution.
	 *
	 * @returns An array of records matching the query options.
	 *
	 * @example
	 * Basic usage with pagination
	 * ```ts
	 * const users = await userRepository.find({
	 *     limit: 25,
	 *     offset: 50  // Get users 51-75
	 * });
	 * ```
	 * @example
	 * With field selection
	 * ```ts
	 * const userNames = await userRepository.find({
	 *     selectedFields: ['id', 'firstName', 'lastName']
	 * });
	 * ```
	 * @example
	 * With filtering
	 * ```ts
	 * const activeAdmins = await userRepository.find({
	 *     filters: {
	 *         isActive: { $eq: true }
	 *     }
	 * });
	 * ```
	 * @example
	 * With OR conditions
	 * ```ts
	 * const results = await userRepository.find({
	 *     filters: [
	 *         { department: 'engineering' },
	 *         { department: 'design', role: 'lead' }
	 *     ]
	 * });
	 * ```
	 * @example
	 * With sorting
	 * ```ts
	 * const sortedUsers = await userRepository.find({
	 *     orderBy: ['lastName', 'asc']
	 * });
	 * ```
	 * @example
	 * Using a transaction
	 * ```ts
	 * await knex.transaction(async (trx) => {
	 *     const users = await userRepository.find({
	 *         filters: { department: 'finance' },
	 *         transaction: trx
	 *     });
	 * });
	 * ```
	 */
	public async find<KModel extends TModel = NoInfer<TModel>>(
		options?: QueryOptionsExtendPagination<KModel>
	): Promise<KModel[]> {
		const query = this._knex(this._table.name);

		this._applyQueryOptions<KModel>(query, options);

		const limit = options?.limit || _DEFAULT_LIMIT;
		const offset = options?.offset || _DEFAULT_OFFSET;
		query
			.limit(limit)
			.offset(offset);
		return this._executeQuery<KModel>(query, options?.throwIfNoResult);
	}

	/**
	 * Counts the number of records in the database based on the specified query options.
	 * This method supports advanced filtering capabilities to count records that match specific criteria.
	 *
	 * @template KModel - The type of the object to count.
	 *
	 * @param options - The query options to apply to the search.
	 *
	 * @throws ({@link HttpError}) Throws an error if no records are found if the {@link QueryOptions.throwIfNoResult} option is enabled.
	 * @throws ({@link HttpError}) Throws an error if an MSSQL-specific error occurs during the query execution.
	 *
	 * @returns The count of records matching the query options.
	 *
	 * @example
	 * Basic usage
	 * ```ts
	 * const userCount = await userRepository.count();
	 * ```
	 * @example
	 * With filtering
	 * ```ts
	 * const activeUserCount = await userRepository.count({
	 *     filters: { isActive: true }
	 * });
	 * ```
	 * @example
	 * Using a transaction
	 * ```ts
	 * await knex.transaction(async (trx) => {
	 *     const userCount = await userRepository.count({
	 *         filters: { department: 'finance' },
	 *         transaction: trx
	 *     });
	 * });
	 * ```
	 */
	public async count<KModel extends TModel = NoInfer<TModel>>(
		options?: Omit<QueryOptions<KModel>, 'selectedFields' | 'orderBy'>
	): Promise<number> {
		const query = this._knex(this._table.name)
			.count({ count: '*' });
		this._applyFilter(query, options?.filters);

		return this._executeQuery<{ count: number }>(query, options?.throwIfNoResult)
			.then((result) => result[0].count);
	}

	/**
	 * Inserts new records into the database and returns the inserted records.
	 * This method supports bulk insertion of multiple records at once.
	 *
	 * @template KModel - The type of the object to insert.
	 *
	 * @param data - The data to insert. Can be a single object or an array of objects.
	 * @param options - The query options to apply to the insertion.
	 *
	 * @throws ({@link HttpError}) Throws an error if an MSSQL-specific error occurs during the query execution.
	 *
	 * @returns An array of inserted records.
	 *
	 * @example
	 * Basic usage
	 * ```ts
	 * const newUser = await userRepository.insert({ name: 'John Doe', email: 'john.doe@example.com' });
	 * ```
	 * @example
	 * With bulk insertion
	 * ```ts
	 * const users = await userRepository.insert([
	 *     { name: 'Jane Doe', email: 'jane.doe@example.com' },
	 *     { name: 'John Smith', email: 'john.smith@example.com' }
	 * ]);
	 * ```
	 * @example
	 * Using a transaction
	 * ```ts
	 * await knex.transaction(async (trx) => {
	 *     const newUser = await userRepository.insert({ name: 'John Doe', email: 'john.doe@example.com' }, {
	 *         transaction: trx
	 *     });
	 * });
	 * ```
	 */
	public async insert<KModel extends TModel = NoInfer<TModel>>(
		data: Partial<KModel> | Partial<KModel>[],
		options?: Omit<QueryOptions<KModel>, 'filters' | 'orderBy'>
	): Promise<KModel[]> {
		const query = this._knex(this._table.name)
			.insert(data)
			.returning(options?.selectedFields ?? '*');

		return this._executeQuery<KModel>(query);
	}

	/**
	 * Updates existing records in the database based on the specified query options and returns the updated records.
	 * This method supports advanced filtering capabilities to update records that match specific criteria.
	 *
	 * @template KModel - The type of the object to update.
	 *
	 * @param data - The data to update. Can be a single object or an array of objects.
	 * @param options - The query options to apply to the update.
	 *
	 * @throws ({@link HttpError}) Throws an error if an MSSQL-specific error occurs during the query execution.
	 *
	 * @returns An array of updated records.
	 *
	 * @example
	 * Basic usage
	 * ```ts
	 * const updatedUser = await userRepository.update({ name: 'John Doe' }, {
	 *     filters: { id: 1 }
	 * });
	 * ```
	 * @example
	 * With filtering
	 * ```ts
	 * const updatedUsers = await userRepository.update({ status: 'inactive' }, {
	 *     filters: { role: 'admin' }
	 * });
	 * ```
	 * @example
	 * Using a transaction
	 * ```ts
	 * await knex.transaction(async (trx) => {
	 *   const updatedUser = await userRepository.update({ name: 'John Doe' }, {
	 *       filters: { id: 1 },
	 *       transaction: trx
	 *   });
	 * });
	 * ```
	 */
	public async update<KModel extends TModel = NoInfer<TModel>>(
		data: Partial<KModel>,
		options: Omit<QueryOptions<KModel>, 'orderBy' | 'filters'> & Required<Pick<QueryOptions<KModel>, 'filters'>>
	): Promise<KModel[]> {
		const query = this._knex(this._table.name)
			.update(data);

		this._applyQueryOptions<KModel>(query, options);

		return this._executeQuery<KModel>(query);
	}

	/**
	 * Deletes records from the database based on the specified query options and returns the deleted records.
	 * This method supports advanced filtering capabilities to filter the records before deletion.
	 *
	 * @template KModel - The type of the object to delete.
	 *
	 * @param options - The query options to apply to the deletion.
	 *
	 * @throws ({@link HttpError}) Throws an error if an MSSQL-specific error occurs during the query execution.
	 *
	 * @returns An array of deleted records.
	 *
	 * @example
	 * Basic usage
	 * ```ts
	 * const deletedUser = await userRepository.delete({
	 *     filters: { id: 1 }
	 * });
	 * ```
	 * @example
	 * With filtering
	 * ```ts
	 * const deletedUsers = await userRepository.delete({
	 *     filters: { status: 'inactive' }
	 * });
	 * ```
	 * @example
	 * Using a transaction
	 * ```ts
	 * await knex.transaction(async (trx) => {
	 *     const deletedUser = await userRepository.delete({
	 *         filters: { id: 1 },
	 *         transaction: trx
	 *     });
	 * });
	 * ```
	 */
	public async delete<KModel extends TModel = NoInfer<TModel>>(
		options: Omit<QueryOptions<KModel>, 'orderBy' | 'filters'> & Required<Pick<QueryOptions<KModel>, 'filters'>>
	): Promise<KModel[]> {
		const query = this._knex(this._table.name)
			.delete();

		this._applyQueryOptions<KModel>(query, options);

		return this._executeQuery<KModel>(query);
	}

	/**
	 * Applies selected fields to a Knex.js query builder. This method supports both single and multiple field selections.
	 * It is used to specify which fields should be returned in the query results.
	 *
	 * @template KModel - The type of the object for query options.
	 *
	 * @param query - The Knex.js query builder to apply the selected fields to.
	 * @param selectedFields - The fields to select. Can be a single field or an array of fields.
	 */
	protected _applySelectedFields<KModel>(
		query: Knex.QueryBuilder,
		selectedFields: QueryOptions<KModel>['selectedFields'] | undefined
	): void {
		const qMethod = (query as unknown as { _method: string })._method;

		if (
			qMethod === 'del'
			|| qMethod === 'update'
			|| qMethod === 'insert'
		)
			query.returning(selectedFields ?? '*');
		else
			query.select(selectedFields ?? '*');
	}

	/**
	 * Applies filter criteria to a Knex.js query builder. This method supports complex queries
	 * using operators like `$eq`, `$neq`, `$lt`, `$lte`, `$gt`, `$gte`, `$in`, `$nin`, `$between`, `$nbetween`,
	 * `$like`, `$nlike`, and `$isNull`. It also supports basic string searches and field selection.
	 *
	 * @template KModel - The type of the object to search for.
	 *
	 * @param query - The Knex.js query builder to apply the search criteria to.
	 * @param search - The advanced search criteria to apply. Can be a single object or an array of objects.
	 */
	protected _applyFilter<KModel>(
		query: Knex.QueryBuilder,
		search: Filter<KModel> | Filter<KModel>[] | undefined
	): void {
		const processing = (query: Knex.QueryBuilder, search: Filter<KModel>): void => {
			for (const key in search) {
				const prop = search[key as keyof Filter<KModel>];
				if (this._filterIsAdaptiveWhereClause(prop)) {
					for (const operator in prop)
						if (operator in _operators && prop[operator as keyof AdaptiveWhereClause<unknown>] !== undefined)
							_operators[operator](query, key, prop[operator as keyof AdaptiveWhereClause<unknown>]);
				} else if (
					key === '$q'
					&& prop !== null
					&& (typeof prop === 'string' || typeof prop === 'number')
				) {
					for (const field of this._table.fields)
						if (prop)
							query.orWhere(field, 'like', `%${prop}%`);
				} else if (
					key === '$q'
					&& prop !== null
					&& typeof prop === 'object'
					&& 'selectedFields' in prop
					&& 'value' in prop
				) {
					const { selectedFields, value } = prop as {
						selectedFields: string | string[];
						value: string | number;
					};
					if (Array.isArray(selectedFields))
						for (const field of selectedFields)
							query.orWhere(field, 'like', `%${value}%`);
					else
						query.orWhere(selectedFields, 'like', `%${value}%`);
				} else {
					if (prop !== null && typeof prop === 'object' && Object.keys(prop).length === 0)
						continue;
					if (prop !== undefined)
						query.where(key, prop);
				}
			}
		};
		if (search && Array.isArray(search))
			search.reduce((acc, item) => acc.orWhere((q) => this._applyFilter(q, item)), query);
		else if (search)
			processing(query, search);
	}

	/**
	 * Applies order by criteria to a Knex.js query builder. This method supports both single and multiple order by items.
	 * It is used to specify the sorting order of the query results.
	 *
	 * @template KModel - The type of the object for query options.
	 *
	 * @param query - The Knex.js query builder to apply the order by criteria to.
	 * @param orderBy - The order by criteria. Can be a single item or an array of items.
	 */
	protected _applyOrderBy<KModel>(
		query: Knex.QueryBuilder,
		orderBy: OrderByItem<KModel> | OrderByItem<KModel>[] | undefined
	): void {
		const qMethod = (query as unknown as { _method: string })._method;

		if (!(qMethod === 'select'))
			return;
		if (!orderBy)
			query.orderBy(this._table.primaryKey[0], 'asc');
		else if (Array.isArray(orderBy))
			orderBy.forEach((item) => {
				query.orderBy(item.selectedField, item.direction);
			});
		else
			query.orderBy(orderBy.selectedField, orderBy.direction);
	}

	/**
	 * Applies query options such as filters, orderBy, and transaction to a Knex.js query builder.
	 *
	 * @template KModel - The type of the object for query options.
	 *
	 * @param query - The Knex.js query builder to apply the options to.
	 * @param options - The query options to apply.
	 */
	protected _applyQueryOptions<KModel>(
		query: Knex.QueryBuilder,
		options?: Omit<QueryOptions<KModel>, 'throwIfNoResult'>
	): void {
		this._applyFilter<KModel>(query, options?.filters);
		this._applyOrderBy<KModel>(query, options?.orderBy);
		this._applySelectedFields<KModel>(query, options?.selectedFields);
		// transaction
	}

	/**
	 * Handles errors that occur during query execution. This method centralizes error handling
	 * for MSSQL-specific errors and throws a {@link HttpError} with relevant information.
	 *
	 * @param error - The error object thrown by Knex.js.
	 * @param query - The Knex.js query builder that caused the error.
	 *
	 * @throws ({@link HttpError}) Throws an error if an MSSQL-specific error occurs during the query execution.
	 *
	 * @returns Never returns, always throws an error.
	 */
	protected _handleError(
		error: unknown,
		query: Knex.QueryBuilder
	): never {
		if (error instanceof HttpError)
			throw error;
		const code = (error as { number: keyof typeof MSSQL_ERROR_CODE })?.number || 0;
		throw new HttpError({
			message: MSSQL_ERROR_CODE[code] ?? DATABASE_ERROR_KEYS.MSSQL_QUERY_ERROR,
			cause: {
				query: query.toSQL().sql,
				error
			}
		});
	}

	/**
	 * Determines if the provided data is a complex query (i.e., a WhereClause).
	 *
	 * @param data - The data to check.
	 *
	 * @returns True if the data is a WhereClause, false otherwise.
	 */
	private _filterIsAdaptiveWhereClause(data: unknown): data is AdaptiveWhereClause<unknown> {
		return Boolean(
			data
			&& typeof data === 'object'
			&& !Array.isArray(data)
			&& Object.keys(data).some((key) => _validOperatorKeys.has(key))
		);
	}

	/**
	 * Executes a Knex.js query and returns the result. This method provides centralized
	 * error handling and supports the option to throw an error if no records are found.
	 *
	 * @template KModel - The type of the records returned by the query.
	 *
	 * @param query - The Knex.js query builder to execute.
	 * @param throwIfNoResult - Whether to throw an error if no records are found.
	 *
	 * @throws ({@link HttpError}) Throws an error if no records are found if the {@link QueryOptions.throwIfNoResult} option is enabled.
	 * @throws ({@link HttpError}) Throws an error if an MSSQL-specific error occurs during the query execution.
	 *
	 * @returns An array of records returned by the query.
	 */
	protected async _executeQuery<KModel>(
		query: Knex.QueryBuilder,
		throwIfNoResult: QueryOptions<KModel>['throwIfNoResult'] = false
	): Promise<KModel[]> {
		try {
			const result: KModel[] = await query;
			if (throwIfNoResult && result.length === 0)
				throw new HttpError({
					message: DATABASE_ERROR_KEYS.MSSQL_NO_RESULT,
					cause: !process.env.NODE_ENV || process.env.NODE_ENV !== 'production' // TODO refactor error system AND-216
						? {
							query: query.toSQL().sql
						}
						: undefined,
					httpStatusCode: 404
				});
			return result;
		} catch (error) {
			return this._handleError(error, query);
		}
	}
}
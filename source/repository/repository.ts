import type { Knex } from 'knex';
import { PassThrough } from 'stream';

import { databaseKeyError } from '#/database/enums/databaseKeyError';
import { mssqlErrorCode } from '#/database/enums/mssqlErrorCode';
import type { Table } from '#/database/table';
import { CoreError } from '#/error/coreError';
import { isIsoDateString } from '#/utils/isIsoDateString';
import { makeStreamAsyncIterable } from '#/utils/stream';
import type { StreamWithAsyncIterable } from '#/utils/types/streamWithAsyncIterable';
import type { AdvancedSearch } from './types/advancedSearch';
import type { QueryOptions } from './types/queryOptions';
import type { QueryOptionsExtendPagination } from './types/queryOptionsExtendPagination';
import type { QueryOptionsExtendStream } from './types/queryOptionsExtendStream';
import type { WhereClause } from './types/whereClause';

type OperatorFn = (
    query: Knex.QueryBuilder,
    column: string,
    value: unknown
) => Knex.QueryBuilder;

const _operators: Record<keyof WhereClause<unknown>, OperatorFn> = ({
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
        if (isIsoDateString(v))
            return q.whereRaw(`CONVERT(VARCHAR, ${c}, 23) LIKE ?`, [likeValue]);
        return q.whereLike(c, likeValue);
    },
    $nlike: (q, c, v) => {
        const likeValue = `%${v}%`;
        if (isIsoDateString(v))
            return q.whereRaw(`CONVERT(VARCHAR, ${c}, 23) NOT LIKE ?`, [likeValue]);
        return q.whereRaw(`${c} NOT LIKE ?`, [likeValue]);
    },
    $isNull: (q, c, v) => (v ? q.whereNull(c) : q.whereNotNull(c))
});

/**
 * Provides a type-safe, extensible interface for database operations (CRUD, search, streaming) on a table.
 *
 * - Wraps Knex.js for query building and execution.
 * - Supports advanced search, pagination, field selection, and streaming.
 * - Centralizes error handling for MSSQL.
 *
 * @template TModel - The data model type handled by the repository.
 *
 * Example:
 * ```typescript
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
     * @see {@link Table}
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
     * @param options - The query options to apply to the search. ({@link QueryOptionsExtendStream})
     *
     * @returns A stream with an async iterable interface for consuming the results. ({@link StreamWithAsyncIterable})
     *
     *
     * ### Usage Examples:
     * @example
     * ```typescript
     * // Basic usage with async iteration
     * const stream = userRepository.findStream();
     * for await (const user of stream) {
     *   console.log(user);
     * }
     *
     * // With ordering and field selection
     * const stream = userRepository.findStream({
     *   selectedFields: ['id', 'name', 'email'],
     *   orderBy: ['createdDate', 'desc']
     * });
     *
     * // Using event listeners
     * const stream = userRepository.findStream();
     * stream.on('data', (user) => {
     *   console.log('User:', user);
     * });
     * stream.on('error', (error) => {
     *   console.error('Stream error:', error);
     * });
     * stream.on('end', () => {
     *   console.log('Stream completed');
     * });
     *
     * // With transform function to process records
     * const stream = userRepository.findStream({
     *   transform: (chunk, encoding, callback) => {
     *     // Transform the data
     *     const transformedData = { ...chunk, processed: true };
     *     callback(null, transformedData);
     *   }
     * });
     * ```
     */
    public findStream<KModel extends TModel = NoInfer<TModel>>(options?: QueryOptionsExtendStream<KModel>): StreamWithAsyncIterable<KModel[]> {
        const query = this._knex(this._table.name)
            .select(options?.selectedFields ?? '*');
        if (options?.advancedSearch)
            this._applySearch(query, options.advancedSearch);

        const orderBy: [string, 'asc' | 'desc'] = [
            options?.orderBy?.[0] || this._table.primaryKey[0],
            options?.orderBy?.[1] || 'asc'
        ];
        query.orderBy(orderBy[0], orderBy[1]);

        const kStream: StreamWithAsyncIterable<KModel> = query.stream();

        const passThrough = new PassThrough({
            objectMode: true,
            ...options?.transform && { transform: options.transform }
        });

        kStream.on('error', (error: unknown) => {
            const code = (error as { number: keyof typeof mssqlErrorCode })?.number || 0;
            passThrough.emit('error', new CoreError({
                key: mssqlErrorCode[code] ?? databaseKeyError.mssqlQueryError,
                message: 'An error occurred while streaming the query results.',
                cause: {
                    query: query.toSQL().sql,
                    error
                }
            }));
        });

        kStream.pipe(passThrough);
        return makeStreamAsyncIterable<KModel, PassThrough>(passThrough);
    }

    /**
     * Finds records in the database based on the specified query options and returns the results
     * as an array. This method supports comprehensive filtering, pagination, field selection, and sorting
     * to provide flexible data retrieval capabilities.
     *
     * @template KModel - The type of the object to retrieve.
     * @param options - The query options to apply to the search. ({@link QueryOptionsExtendPagination})
     *
     * @throws ({@link CoreError}) Throws an error if no records are found and the `throwIfNoResult` option is enabled. ({@link databaseKeyError.mssqlNoResult})
     * @throws ({@link CoreError}) Throws an error if an MSSQL-specific error occurs during the query execution. ({@link databaseKeyError})
     *
     * @returns An array of records matching the query options. ({@link KModel})
     *
     * ### Usage Examples:
     * @example
     * ```typescript
     * // Basic usage with pagination
     * const users = await userRepository.find({
     *   limit: 25,
     *   offset: 50  // Get users 51-75
     * });
     *
     * // With field selection
     * const userNames = await userRepository.find({
     *   selectedFields: ['id', 'firstName', 'lastName']
     * });
     *
     * // With advanced filtering
     * const activeAdmins = await userRepository.find({
     *   advancedSearch: {
     *     role: 'admin',
     *     status: { $eq: 'active' },
     *     lastLogin: { $gte: new Date('2023-01-01') }
     *   }
     * });
     *
     * // With OR conditions
     * const results = await userRepository.find({
     *   advancedSearch: [
     *     { department: 'engineering' },
     *     { department: 'design', role: 'lead' }
     *   ]
     * });
     *
     * // With sorting
     * const sortedUsers = await userRepository.find({
     *   orderBy: ['lastName', 'asc']
     * });
     *
     * // Using a transaction
     * await knex.transaction(async (trx) => {
     *   const users = await userRepository.find({
     *     advancedSearch: { department: 'finance' },
     *     transaction: trx
     *   });
     * });
     * ```
     */
    public async find<KModel extends TModel = NoInfer<TModel>>(options?: QueryOptionsExtendPagination<KModel>): Promise<KModel[]> {
        const query = this._knex(this._table.name)
            .select(options?.selectedFields ?? '*');
        if (options?.advancedSearch)
            this._applySearch(query, options.advancedSearch);

        const orderBy: [string, 'asc' | 'desc'] = [
            options?.orderBy?.[0] || this._table.primaryKey[0],
            options?.orderBy?.[1] || 'asc'
        ];
        const limit = options?.limit || 100;
        const offset = options?.offset || 0;

        query.orderBy(orderBy[0], orderBy[1])
            .limit(limit)
            .offset(offset);

        return this._executeQuery<KModel>(query, options?.throwIfNoResult);
    }

    /**
     * Finds a single record in the database based on the specified query options and returns the result.
     * This method supports comprehensive filtering, field selection, and sorting to provide flexible data retrieval capabilities.
     *
     * @template KModel - The type of the object to retrieve.
     * @param options - The query options to apply to the search. ({@link QueryOptionsExtendPagination})
     *
     * @throws ({@link CoreError}) Throws an error if no records are found and the `throwIfNoResult` option is enabled. ({@link databaseKeyError.mssqlNoResult})
     * @throws ({@link CoreError}) Throws an error if an MSSQL-specific error occurs during the query execution. ({@link databaseKeyError})
     *
     * @returns A single record matching the query options. ({@link KModel})
     *
     * ### Usage Examples:
     * @example
     * ```typescript
     * // Basic usage
     * const user = await userRepository.findOne({
     *   advancedSearch: { id: 1 }
     * });
     *
     * // With field selection
     * const user = await userRepository.findOne({
     *   selectedFields: ['id', 'firstName', 'lastName'],
     *   advancedSearch: { id: 1 }
     * });
     *
     * // With advanced filtering
     * const user = await userRepository.findOne({
     *   advancedSearch: {
     *     role: 'admin',
     *     status: { $eq: 'active' },
     *   }
     * });
     *
     * // With sorting
     * const user = await userRepository.findOne({
     *   orderBy: ['lastName', 'asc']
     * });
     *
     * // Using a transaction
     * await knex.transaction(async (trx) => {
     *   const user = await userRepository.findOne({
     *       advancedSearch: { department: 'finance' },
     *       transaction: trx
     *   });
     * });
     * ```
     */
    public async findOne<KModel extends TModel = NoInfer<TModel>>(options: Omit<QueryOptions<KModel>, 'advancedSearch'> & Required<Pick<QueryOptions<KModel>, 'advancedSearch'>>): Promise<KModel> {
        const query = this._knex(this._table.name)
            .select(options?.selectedFields ?? '*');
        if (options?.advancedSearch)
            this._applySearch(query, options.advancedSearch);

        const orderBy: [string, 'asc' | 'desc'] = [
            options?.orderBy?.[0] || this._table.primaryKey[0],
            options?.orderBy?.[1] || 'asc'
        ];

        query.orderBy(orderBy[0], orderBy[1]);

        return this._executeQuery<KModel>(query, options?.throwIfNoResult)
            .then((result) => result[0]);
    }

    /**
     * Counts the number of records in the database based on the specified query options.
     * This method supports advanced search capabilities to filter the records before counting.
     *
     * @template KModel - The type of the object to count.
     * @param options - The query options to apply to the search. ({@link QueryOptions})
     *
     * @throws ({@link CoreError}) Throws an error if no records are found and the `throwIfNoResult` option is enabled. ({@link databaseKeyError.mssqlNoResult})
     * @throws ({@link CoreError}) Throws an error if an MSSQL-specific error occurs during the query execution. ({@link databaseKeyError})
     *
     * @returns The count of records matching the query options.
     *
     * ### Usage Examples:
     * @example
     * ```typescript
     * // Basic usage
     * const userCount = await userRepository.count();
     *
     * // With advanced filtering
     * const activeUserCount = await userRepository.count({
     *   advancedSearch: { status: 'active' }
     * });
     *
     * // Using a transaction
     * await knex.transaction(async (trx) => {
     *   const userCount = await userRepository.count({
     *       advancedSearch: { department: 'finance' },
     *       transaction: trx
     *   });
     * });
     * ```
     */
    public async count<KModel extends TModel = NoInfer<TModel>>(options?: Omit<QueryOptions<KModel>, 'selectedFields' | 'orderBy'>): Promise<number> {
        const query = this._knex(this._table.name)
            .count({ count: '*' });
        if (options?.advancedSearch)
            this._applySearch(query, options.advancedSearch);

        return this._executeQuery<{ count: number }>(query, options?.throwIfNoResult)
            .then((result) => result[0].count);
    }

    /**
     * Inserts new records into the database and returns the inserted records.
     * This method supports bulk insertion of multiple records at once.
     *
     * @template KModel - The type of the object to insert.
     * @param data - The data to insert. Can be a single object or an array of objects.
     * @param options - The query options to apply to the insertion. ({@link QueryOptions})
     *
     * @throws ({@link CoreError}) Throws an error if an MSSQL-specific error occurs during the query execution. ({@link databaseKeyError})
     *
     * @returns An array of inserted records.
     *
     * ### Usage Examples:
     * @example
     * ```typescript
     * // Basic usage
     * const newUser = await userRepository.insert({ name: 'John Doe', email: 'john.doe@example.com' });
     *
     * // With bulk insertion
     * const users = await userRepository.insert([
     *   { name: 'Jane Doe', email: 'jane.doe@example.com' },
     *   { name: 'John Smith', email: 'john.smith@example.com' }
     * ]);
     *
     * // Using a transaction
     * await knex.transaction(async (trx) => {
     *   const newUser = await userRepository.insert({ name: 'John Doe', email: 'john.doe@example.com' }, {
     *       transaction: trx
     *   });
     * });
     * ```
     */
    public async insert<KModel extends TModel = NoInfer<TModel>>(
        data: Partial<KModel> | Partial<KModel>[],
        options?: Omit<QueryOptions<KModel>, 'advancedSearch' | 'orderBy'>
    ): Promise<KModel[]> {
        const query = this._knex(this._table.name)
            .insert(data)
            .returning(options?.selectedFields ?? '*');

        return this._executeQuery<KModel>(query);
    }

    /**
     * Updates existing records in the database based on the specified query options and returns the updated records.
     * This method supports advanced search capabilities to filter the records before updating.
     *
     * @template KModel - The type of the object to update.
     * @param data - The data to update. Can be a single object or an array of objects.
     * @param options - The query options to apply to the update. ({@link QueryOptions})
     *
     * @throws ({@link CoreError}) Throws an error if an MSSQL-specific error occurs during the query execution. ({@link databaseKeyError})
     *
     * @returns An array of updated records.
     *
     * ### Usage Examples:
     * @example
     * ```typescript
     * // Basic usage
     * const updatedUser = await userRepository.update({ name: 'John Doe' }, {
     *   advancedSearch: { id: 1 }
     * });
     *
     * // With advanced filtering
     * const updatedUsers = await userRepository.update({ status: 'inactive' }, {
     *   advancedSearch: { role: 'admin' }
     * });
     *
     * // Using a transaction
     * await knex.transaction(async (trx) => {
     *   const updatedUser = await userRepository.update({ name: 'John Doe' }, {
     *       advancedSearch: { id: 1 },
     *       transaction: trx
     *   });
     * });
     * ```
     */
    public async update<KModel extends TModel = NoInfer<TModel>>(
        data: Partial<KModel>,
        options: Omit<QueryOptions<KModel>, 'orderBy' | 'advancedSearch'> & Required<Pick<QueryOptions<KModel>, 'advancedSearch'>>
    ): Promise<KModel[]> {
        const query = this._knex(this._table.name)
            .update(data)
            .returning(options?.selectedFields ?? '*');
        if (options?.advancedSearch)
            this._applySearch(query, options.advancedSearch);

        return this._executeQuery<KModel>(query);
    }

    /**
     * Deletes records from the database based on the specified query options and returns the deleted records.
     * This method supports advanced search capabilities to filter the records before deletion.
     *
     * @template KModel - The type of the object to delete.
     * @param options - The query options to apply to the deletion. ({@link QueryOptions})
     *
     * @throws ({@link CoreError}) Throws an error if an MSSQL-specific error occurs during the query execution. ({@link databaseKeyError})
     *
     * @returns An array of deleted records.
     *
     * ### Usage Examples:
     * @example
     * ```typescript
     * // Basic usage
     * const deletedUser = await userRepository.delete({
     *   advancedSearch: { id: 1 }
     * });
     *
     * // With advanced filtering
     * const deletedUsers = await userRepository.delete({
     *   advancedSearch: { status: 'inactive' }
     * });
     *
     * // Using a transaction
     * await knex.transaction(async (trx) => {
     *   const deletedUser = await userRepository.delete({
     *       advancedSearch: { id: 1 },
     *       transaction: trx
     *   });
     * });
     * ```
     */
    public async delete<KModel extends TModel = NoInfer<TModel>>(options: Omit<QueryOptions<KModel>, 'orderBy' | 'advancedSearch'> & Required<Pick<QueryOptions<KModel>, 'advancedSearch'>>): Promise<KModel[]> {
        const query = this._knex(this._table.name)
            .delete()
            .returning(options?.selectedFields ?? '*');
        if (options?.advancedSearch)
            this._applySearch(query, options.advancedSearch);

        return this._executeQuery<KModel>(query);
    }

    /**
     * Applies advanced search criteria to a Knex.js query builder. This method supports complex queries
     * using operators like `$eq`, `$neq`, `$lt`, `$lte`, `$gt`, `$gte`, `$in`, `$nin`, `$between`, `$nbetween`,
     * `$like`, `$nlike`, and `$isNull`. It also supports basic string searches and field selection.
     *
     * @template KModel - The type of the object to search for.
     * @param query - The Knex.js query builder to apply the search criteria to. ({@link Knex.QueryBuilder})
     * @param search - The advanced search criteria to apply. Can be a single object or an array of objects. ({@link AdvancedSearch})
     */
    protected _applySearch<KModel>(
        query: Knex.QueryBuilder,
        search: AdvancedSearch<KModel> | AdvancedSearch<KModel>[]
    ): void {
        const processing = (query: Knex.QueryBuilder, search: AdvancedSearch<KModel>): void => {
            for (const [key, value] of Object.entries(search))
                if (this._isComplexQuery(value)) {
                    const whereClause = value as WhereClause<unknown>;
                    for (const [operator, opValue] of Object.entries(whereClause))
                        if (operator in _operators) {
                            const func = _operators[operator as keyof WhereClause<unknown>];
                            func(query, key, opValue);
                        }
                } else if (key === '$q' && (typeof value === 'string' || typeof value === 'number')) {
                    for (const field of this._table.fields)
                        if (value)
                            query.orWhere(field, 'like', `%${value}%`); // TODO add table in prefix
                } else if (key === '$q' && typeof value === 'object' && 'selectedFields' in value) {
                    const { selectedFields, value: searchValue } = value;
                    const isNumber = typeof searchValue === 'number';
                    const operator = isNumber ? '=' : 'like';
                    const formattedValue = isNumber ? searchValue : `%${searchValue}%`;

                    selectedFields.forEach((field) => {
                        query.orWhere(field, operator, formattedValue);
                    });
                } else {
                    if (typeof value === 'object' && Object.keys(value).length === 0)
                        continue;
                    query.where(key, value);
                }
        };
        if (Array.isArray(search))
            search.reduce((acc, item) => acc.orWhere((q) => this._applySearch(q, item)), query);
        else
            processing(query, search);
    }

    /**
     * Handles errors that occur during query execution. This method centralizes error handling
     * for MSSQL-specific errors and throws a {@link CoreError} with relevant information.
     *
     * @param error - The error object thrown by Knex.js.
     * @param query - The Knex.js query builder that caused the error.
     *
     * @throws ({@link CoreError}) Throws an error if an MSSQL-specific error occurs during the query execution. ({@link databaseKeyError})
     *
     * @returns Never returns, always throws an error.
     */
    protected _handleError(error: unknown, query: Knex.QueryBuilder): never {
        if (error instanceof CoreError)
            throw error;
        const code = (error as { number: keyof typeof mssqlErrorCode })?.number || 0;
        throw new CoreError({
            key: mssqlErrorCode[code] ?? databaseKeyError.mssqlQueryError,
            message: 'An error occurred while executing the query.',
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
     * @returns True if the data is a WhereClause, false otherwise.
     */
    private _isComplexQuery(data: unknown): data is WhereClause<unknown> {
        const validKeys = new Set<string>([
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
        return Boolean(
            data
            && typeof data === 'object'
            && !Array.isArray(data)
            && Object.keys(data).some((key) => validKeys.has(key))
        );
    }


    /**
     * Executes a Knex.js query and returns the result. This method provides centralized
     * error handling and supports the option to throw an error if no records are found.
     *
     * @template KModel - The type of the records returned by the query.
     * @param query - The Knex.js query builder to execute.
     * @param throwIfNoResult - Whether to throw an error if no records are found.
     *
     * @throws ({@link CoreError}) Throws an error if no records are found and the `throwIfNoResult` option is enabled. ({@link databaseKeyError.mssqlNoResult})
     * @throws ({@link CoreError}) Throws an error if an MSSQL-specific error occurs during the query execution. ({@link databaseKeyError})
     *
     * @returns An array of records returned by the query.
     */
    protected async _executeQuery<KModel>(query: Knex.QueryBuilder, throwIfNoResult = false): Promise<KModel[]> {
        try {
            const result: KModel[] = await query;
            if (throwIfNoResult && result.length === 0)
                throw new CoreError({
                    key: databaseKeyError.mssqlNoResult,
                    message: 'No records found matching the specified query options.',
                    cause: {
                        query: query.toSQL().sql
                    }
                });
            return result;
        } catch (error) {
            return this._handleError(error, query);
        }
    }
}
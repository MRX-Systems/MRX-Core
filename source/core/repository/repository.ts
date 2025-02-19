import type { Knex } from 'knex';
import { PassThrough } from 'stream';

import type { Table } from '#/core/database/table';
import { makeStreamAsyncIterable } from '#/core/util/stream';
import { CoreError } from '#/error/coreError';
import { DATABASE_KEY_ERROR } from '#/error/key/databaseKeyError';
import { MSSQL_ERROR_CODE } from '#/types/constant/mssqlErrorCode';
import type { AdvancedSearch } from '#/types/data/advancedSearch';

import type { QueryOptions } from '#/types/data/queryOptions';
import type { QueryOptionsExtendPagination } from '#/types/data/queryOptionsExtendPagination';
import type { QueryOptionsExtendStream } from '#/types/data/queryOptionsExtendStream';
import type { StreamWithAsyncIterable } from '#/types/data/streamWithAsyncIterable';
import type { WhereClause } from '#/types/data/whereClause';

/**
 * The `Repository` class provides a robust and extensible implementation for handling database operations
 * such as querying, insertion, update, and deletion. It acts as a wrapper around Knex.js to simplify
 * database interactions while maintaining flexibility and type safety.
 *
 * This class is designed to support common database operations using various query options such as
 * field selection, ordering, pagination, advanced filtering, and streaming. The `Repository` class can
 * be extended or used directly to interact with a specific table in the database.
 *
 * ### Key Features:
 * - **CRUD Operations**: Supports all basic operations: `find`, `findOne`, `insert`, `update`, and `delete`.
 * - **Streaming Queries**: Allows streaming large datasets using the `findStream` method, with support for both
 *   async iteration and event-driven consumption.
 * - **Advanced Query Options**: Supports advanced search filters, pagination, and field selection.
 * - **Error Handling**: Centralized error handling with custom error codes for MSSQL-specific errors.
 * - **Type Safety**: Ensures type safety for queries and results with TypeScript generics.
 *
 * @typeParam TModel - The type of the data model handled by the repository.
 *
 * ### Example Usage:
 * @example
 * ```typescript
 * import { Repository } from './repository';
 * import knex from 'knex';
 * import { Table } from './table';
 *
 * interface User {
 *     id: number;
 *     name: string;
 * }
 *
 * const knexInstance = knex({
 *     client: 'mssql',
 *     connection: {
 *         database: 'myDatabase',
 *         host: 'localhost',
 *         port: 1433,
 *         user: 'sa',
 *         password: 'password',
 *         options: { encrypt: true }
 *     }
 * });
 *
 * const userTable = new Table('users', ['id', 'name']);
 * const userRepository = new Repository<User>(knexInstance, userTable);
 *
 * // Example 1: Find all users with pagination
 * const users = await userRepository.find({ limit: 10, offset: 0 });
 * console.log(users);
 *
 * // Example 2: Find a single user by ID
 * const user = await userRepository.findOne({ advancedSearch: { id: { $eq: 1 } } });
 * console.log(user);
 *
 * // Example 3: Insert a new user
 * const newUser = await userRepository.insert({ id: 2, name: 'Alice' });
 * console.log(newUser);
 *
 * // Example 4: Update a user's name
 * const updatedUser = await userRepository.update({ name: 'Bob' }, { advancedSearch: { id: { $eq: 2 } } });
 * console.log(updatedUser);
 *
 * // Example 5: Stream large datasets
 * const stream = userRepository.findStream({ orderBy: ['id', 'asc'] });
 * for await (const user of stream) {
 *     console.log(user);
 * }
 * ```
 *
 * ### Methods Overview:
 * - **findStream**: Returns a stream for querying large datasets.
 * - **find**: Fetches multiple records with optional pagination and filtering.
 * - **findOne**: Fetches a single record based on the specified query options.
 * - **insert**: Inserts one or more records and returns the inserted records.
 * - **update**: Updates records based on query options and returns the updated records.
 * - **delete**: Deletes records based on query options and returns the deleted records.
 * - **count**: Counts the number of records matching the specified query options.
 */

export class Repository<TModel = unknown> {
    /**
     * The Knex.js instance used to interact with the database. ({@link Knex})
     */
    protected readonly _knex: Knex;

    /**
     * The table object representing the database table to interact with. ({@link Table})
     */
    protected readonly _table: Table;

    /**
     * Creates a new `Repository` instance with the specified Knex.js instance and table object.
     *
     * @param knex - The Knex.js instance used to interact with the database. ({@link Knex})
     * @param table - The table object representing the database table to interact with. ({@link Table})
     */
    public constructor(knex: Knex, table: Table) {
        this._knex = knex;
        this._table = table;
    }

    /**
     * Finds records in the database based on the specified query options and returns a stream
     * for async iteration. The stream emits data events for each record and an end event when
     * the stream is finished.
     *
     * @typeParam KModel - The type of the object to retrieve.
     * @param options - The query options to apply to the search. ({@link QueryOptionsExtendStream})
     *
     * @returns A stream with an async iterable interface. ({@link StreamWithAsyncIterable})
     *
     * @example
     * ```typescript
     * const stream = userRepository.findStream({ orderBy: ['id', 'asc'] });
     *
     * // Method 1: Async iteration
     * for await (const user of stream)
     *    console.log(user);
     *
     * // Method 2: Event-driven consumption
     * stream.on('data', (user) => console.log(user));
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
            const code = (error as { number: number })?.number || 0;
            passThrough.emit('error', new CoreError({
                key: MSSQL_ERROR_CODE[code] ?? DATABASE_KEY_ERROR.MSSQL_QUERY_ERROR,
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
     * as an array. The query options can include advanced search filters, pagination, field selection, and ordering.
     * If no records are found and the `throwIfNoResult` option is enabled, an error is thrown.
     *
     * @typeParam KModel - The type of the object to retrieve.
     * @param options - The query options to apply to the search. ({@link QueryOptionsExtendPagination})
     *
     * @throws ({@link CoreError}): Throws an error if no records are found and the `throwIfNoResult` option is enabled. ({@link DATABASE_KEY_ERROR.MSSQL_NO_RESULT})
     * @throws ({@link CoreError}): Throws an error if an MSSQL-specific error occurs during the query execution. ({@link DATABASE_KEY_ERROR}.[ERROR_CODE] or {@link DATABASE_KEY_ERROR.MSSQL_QUERY_ERROR})
     *
     * @returns An array of records matching the query options. ({@link KModel}[])
     *
     * @example
     * ```typescript
     * // Example 1: Find all users with pagination
     * const users = await userRepository.find({ limit: 10, offset: 0 });
     * console.log(users);
     *
     * // Example 2.a: Find all users with advanced search
     * const users = await userRepository.find({
     *     advancedSearch: {
     *         id: { $gt: 10 },
     *         name: { $match: 'Alice' }
     *     }
     * });
     *
     * // Example 2.b: Find all users with advanced search
     * const users = await userRepository.find({
     *     advancedSearch: {
     *         id: 2
     *     }
     * });
     *
     * // Example 2.c: Find all users with advanced search (multiple conditions)
     * const users = await userRepository.find({
     *     advancedSearch: [
     *         { id: { $gt: 10 } },
     *         { name: { $match: 'Alice' } }
     *     ]
     * });
     *
     * // Example 3: Find all users with field selection
     * const users = await userRepository.find({
     *     selectedFields: {
     *         id: true,
     *     }
     * });
     *
     * // Example 4: Find all users with ordering
     * const users = await userRepository.find({
     *    orderBy: ['id', 'asc']
     * });
     *
     * // Example 5: Using transaction
     * const knex = ...;
     * await knex.transaction(async (trx) => { // u Get the knex instance from the MSSQL class
     *    const user = await userRepository.find({ selectedFields: { id: true }, transaction: trx });
     * });
     * ...
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
     * Finds a single record in the database based on the specified query options and returns it.
     * The query options support advanced search filters, field selection, and ordering.
     * If no records are found and the `throwIfNoResult` option is enabled, an error is thrown.
     *
     * @typeParam KModel - The type of the object to retrieve.
     * @param options - The query options to apply to the search. ({@link QueryOptions})
     *
     * @throws ({@link CoreError}): Throws an error if no records are found and `throwIfNoResult` is enabled. ({@link DATABASE_KEY_ERROR.MSSQL_NO_RESULT})
     * @throws ({@link CoreError}): Throws an error if an MSSQL-specific error occurs during query execution. ({@link DATABASE_KEY_ERROR.MSSQL_QUERY_ERROR})
     *
     * @returns The record matching the query options. ({@link KModel})
     *
     * @example
     * ```typescript
     * // Find a single user by ID
     * const user = await userRepository.findOne({ advancedSearch: { id: { $eq: 1 } } });
     * console.log(user);
     *
     * // Find a single user with specific fields
     * const user = await userRepository.findOne({
     *     advancedSearch: { id: { $eq: 1 } },
     *     selectedFields: { id: true, name: true }
     * });
     *
     * // Find a single user with ordering
     * const user = await userRepository.findOne({
     *     advancedSearch: { id: { $gte: 1 } },
     *     orderBy: ['id', 'desc']
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
     * Counts the number of records in the database that match the specified query options.
     * The query options support advanced search filters. If no records are found and the
     * `throwIfNoResult` option is enabled, an error is thrown.
     *
     * @typeParam KModel - The type of the object to match.
     * @param options - The query options to apply to the count operation. ({@link QueryOptions})
     *
     * @throws ({@link CoreError}): Throws an error if no records are found and `throwIfNoResult` is enabled. ({@link DATABASE_KEY_ERROR.MSSQL_NO_RESULT})
     * @throws ({@link CoreError}): Throws an error if an MSSQL-specific error occurs during query execution. ({@link DATABASE_KEY_ERROR.MSSQL_QUERY_ERROR})
     *
     * @returns The number of records matching the query options. (number)
     *
     * @example
     * ```typescript
     * // Count all users
     * const count = await userRepository.count();
     * console.log(count);
     *
     * // Count users with advanced search filters
     * const count = await userRepository.count({
     *     advancedSearch: { name: { $match: 'Alice' } }
     * });
     * console.log(count);
     * ```
     */
    public async count<KModel extends TModel = NoInfer<TModel>>(options?: QueryOptions<KModel>): Promise<number> {
        const query = this._knex(this._table.name)
            .count({ count: '*' });
        if (options?.advancedSearch)
            this._applySearch(query, options.advancedSearch);

        return this._executeQuery<{ count: number }>(query, options?.throwIfNoResult)
            .then((result) => result[0].count);
    }

    /**
     * Inserts one or more records into the database and returns the inserted records.
     * The data can be a single object or an array of objects. Field selection can be used
     * to specify which fields to return.
     *
     * @typeParam KModel - The type of the object to insert.
     * @param data - The data to insert into the database. (K | K[])
     * @param options - The query options to apply to the insertion. ({@link QueryOptions})
     *
     * @returns An array of the inserted records. ({@link KModel}[])
     *
     * @example
     * ```typescript
     * // Insert a single user
     * const user = await userRepository.insert({ id: 1, name: 'Alice' });
     * console.log(user);
     *
     * // Insert multiple users
     * const users = await userRepository.insert([
     *     { id: 2, name: 'Bob' },
     *     { id: 3, name: 'Charlie' }
     * ]);
     * console.log(users);
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
     * Updates one or more records in the database based on the specified query options
     * and returns the updated records. The query options support advanced search filters
     * and field selection.
     *
     * @typeParam KModel - The type of the object to update.
     * @param data - The data to update in the database. (Partial<K>)
     * @param options - The query options to apply to the update operation. ({@link QueryOptions})
     *
     * @returns An array of the updated records. ({@link KModel}[])
     *
     * @example
     * ```typescript
     * // Update a single user's name
     * const user = await userRepository.update({ name: 'Updated Name' }, { advancedSearch: { id: { $eq: 1 } } });
     * console.log(user);
     *
     * // Update multiple users
     * const users = await userRepository.update(
     *     { active: false },
     *     { advancedSearch: { role: { $eq: 'admin' } } }
     * );
     * console.log(users);
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
     * Deletes one or more records in the database based on the specified query options
     * and returns the deleted records. The query options support advanced search filters
     * and field selection.
     *
     * @typeParam KModel - The type of the object to delete.
     * @param options - The query options to apply to the delete operation. ({@link QueryOptions})
     *
     * @returns An array of the deleted records. ({@link KModel}[])
     *
     * @example
     * ```typescript
     * // Delete a single user
     * const user = await userRepository.delete({ advancedSearch: { id: { $eq: 1 } } });
     * console.log(user);
     *
     * // Delete multiple users
     * const users = await userRepository.delete({
     *     advancedSearch: { role: { $eq: 'guest' } }
     * });
     * console.log(users);
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
     * Applies advanced search filters to a query object. This method translates
     * search options into SQL WHERE clauses using the specified operators and conditions.
     *
     * @typeParam KModel - The type of the object to apply the search filters to.
     * @param query - The Knex.js query builder to apply the filters to. ({@link Knex.QueryBuilder})
     * @param search - The advanced search options to apply. ({@link AdvancedSearch})
     *
     * @example
     * ```typescript
     * // Apply a single search filter
     * const query = knex('users');
     * userRepository._applySearch(query, { id: { $eq: 1 } });
     * console.log(query.toString()); // SELECT * FROM "users" WHERE "id" = 1
     *
     * // Apply multiple filters
     * const query = knex('users');
     * userRepository._applySearch(query, {
     *     id: { $gte: 10 },
     *     name: { $match: 'Alice' }
     * });
     * console.log(query.toString()); // SELECT * FROM "users" WHERE "id" >= 10 AND "name" LIKE '%Alice%'
     * ```
     */
    protected _applySearch<KModel>(
        query: Knex.QueryBuilder,
        search: AdvancedSearch<KModel> | AdvancedSearch<KModel>[]
    ): void {
        type OperatorFunction = (query: Knex.QueryBuilder, key: string, value: unknown) => void;
        const keysFunc: Record<keyof WhereClause, OperatorFunction> = {
            $eq: (query, key, value) => {
                query.where(key, value as string | number | boolean | Date);
            },
            $neq: (query, key, value) => {
                query.whereNot(key, value as string | number | boolean | Date);
            },
            $lt: (query, key, value) => {
                query.where(key, '<', value as string | number | Date);
            },
            $lte: (query, key, value) => {
                query.where(key, '<=', value as string | number | Date);
            },
            $gt: (query, key, value) => {
                query.where(key, '>', value as string | number | Date);
            },
            $gte: (query, key, value) => {
                query.where(key, '>=', value as string | number | Date);
            },
            $in: (query, key, value) => {
                query.whereIn(key, value as string[] | number[] | Date[]);
            },
            $nin: (query, key, value) => {
                query.whereNotIn(key, value as string[] | number[] | Date[]);
            },
            $between: (query, key, value) => {
                query.whereBetween(key, value as [string | number | Date, string | number | Date]);
            },
            $nbetween: (query, key, value) => {
                query.whereNotBetween(key, value as [string | number | Date, string | number | Date]);
            },
            $like: (query, key, value) => {
                const likeValue = `%${value}%`;
                if (typeof value === 'string' && new Date(value).toString() !== 'Invalid Date') {
                    const { client } = this._knex.client.config;
                    if (client === 'mssql')
                        query.whereRaw(`CONVERT(VARCHAR, ${key}, 23) LIKE ?`, [likeValue]);
                } else {
                    query.whereLike(key, likeValue);
                }
            },
            $nlike: (query, key, value) => {
                const likeValue = `%${value}%`;
                if (typeof value === 'string' && new Date(value).toString() !== 'Invalid Date') {
                    const { client } = this._knex.client.config;
                    if (client === 'mssql')
                        query.whereRaw(`CONVERT(VARCHAR, ${key}, 23) NOT LIKE ?`, [likeValue]);
                } else {
                    query.whereRaw(`${key} NOT LIKE ?`, [likeValue]);
                }
            },
            $isNull: (query, key, value) => {
                if (value)
                    query.whereNull(key);
                else
                    query.whereNotNull(key);
            }
        };

        const checkField = (field: string): boolean => {
            if (!this._table.fields.includes(field))
                return false;
            return true;
        };

        const processing = (query: Knex.QueryBuilder, search: AdvancedSearch<KModel>): void => {
            for (const [key, value] of Object.entries(search))
                if (this._isComplexQuery(value)) {
                    const whereClause = value as WhereClause;
                    for (const [operator, opValue] of Object.entries(whereClause))
                        if (operator in keysFunc) {
                            const func = keysFunc[operator as keyof WhereClause];
                            func(query, key, opValue);
                        }
                } else if (key === '$q' && typeof value === 'object' && 'selectedField' in value) {
                    const { selectedField, value: searchValue } = value;
                    selectedField.forEach((field) => {
                        if (this._table.fields.includes(field as string))
                            query.orWhere(field as string, 'like', `%${searchValue}%`);
                    });
                } else if (key === '$q' && typeof value === 'string') {
                    for (const field of this._table.fields) {
                        if (!value) continue;
                        query.orWhere(field, 'like', `%${value}%`);
                    }
                } else if (key === '$q'
                    && typeof value === 'object'
                    && value !== null
                ) {
                    for (const [col, searchValue] of Object.entries(value))
                        if (checkField(col))
                            query.orWhere(col, 'like', `%${searchValue}%`);
                } else {
                    if (typeof value === 'object' && Object.keys(value).length === 0)
                        continue;
                    if (checkField(key))
                        query.where(key, value);
                }
        };
        if (Array.isArray(search))
            search.reduce((acc, item) => acc.orWhere((q) => this._applySearch(q, item)), query);
        else
            processing(query, search);
    }

    /**
     * Determines whether the provided data object represents a complex query.
     * A complex query is defined as an object containing one or more valid query operators.
     *
     * @typeParam MaybeWhereClause - The type of the object to check.
     * @param data - The data object to check.
     *
     * @returns `true` if the object contains valid query operators, otherwise `false`.
     *
     * @example
     * ```typescript
     * // Check a valid complex query
     * const isComplex = userRepository._isComplexQuery({ $eq: 1 });
     * console.log(isComplex); // true
     *
     * // Check an invalid complex query
     * const isComplex = userRepository._isComplexQuery({ invalidKey: 1 });
     * console.log(isComplex); // false
     * ```
     */
    private _isComplexQuery<MaybeWhereClause>(data: MaybeWhereClause): boolean {
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
     * Executes a Knex.js query and returns the result. If the `throwIfNoResult` option
     * is enabled and no records are found, an error is thrown.
     *
     * @typeParam KModel - The type of the records returned by the query.
     * @param query - The Knex.js query builder to execute. ({@link Knex.QueryBuilder})
     * @param throwIfNoResult - Whether to throw an error if no records are found.
     *
     * @throws ({@link CoreError}): Throws an error if no records are found and `throwIfNoResult` is enabled. ({@link DATABASE_KEY_ERROR.MSSQL_NO_RESULT})
     * @throws ({@link CoreError}): Throws an error if an MSSQL-specific error occurs during query execution. ({@link DATABASE_KEY_ERROR.MSSQL_QUERY_ERROR})
     *
     * @returns An array of records returned by the query. ({@link KModel}[])
     *
     * @example
     * ```typescript
     * // Execute a query and handle the result
     * const query = knex('users').where('id', 1);
     * const users = await userRepository._executeQuery(query);
     * console.log(users);
     *
     * // Execute a query and throw an error if no result
     * const query = knex('users').where('id', 999);
     * const users = await userRepository._executeQuery(query, true);
     * // Throws CoreError if no records are found
     * ```
     */
    private async _executeQuery<KModel>(query: Knex.QueryBuilder, throwIfNoResult = false): Promise<KModel[]> {
        try {
            const result: KModel[] = await query;
            if (throwIfNoResult && result.length === 0)
                throw new CoreError({
                    key: DATABASE_KEY_ERROR.MSSQL_NO_RESULT,
                    message: 'No records found matching the specified query options.',
                    cause: {
                        query: query.toSQL().sql
                    }
                });
            return result;
        } catch (error) {
            if (error instanceof CoreError)
                throw error;
            const code = (error as { number: number })?.number || 0;
            throw new CoreError({
                key: MSSQL_ERROR_CODE[code] ?? DATABASE_KEY_ERROR.MSSQL_QUERY_ERROR,
                message: 'An error occurred while executing the query.',
                cause: {
                    query: query.toSQL().sql,
                    error
                }
            });
        }
    }
}
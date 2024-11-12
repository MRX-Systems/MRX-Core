import type { Knex } from 'knex';

import { CoreError } from '#/common/error/core.error.ts';
import { ErrorKeys } from '#/common/error/keys.error.ts';

import type { Transaction } from '#/common/lib/optional/knex/knex.lib.ts';
import type { ColumnsSelection } from '#/common/type/data/infrastructure/repository/columnsSelection.data.ts';
import type { SearchModel } from '#/common/type/data/infrastructure/repository/searchModel.data.ts';
import type { WhereClause } from '#/common/type/data/infrastructure/repository/whereClause.data.ts';
import { FactoryDatabase } from '#/infrastructure/database/factory.database.ts';

/**
 * Interface Option query
 */
export interface QueryOptions {
    /**
     * If the query does not return any result, throw an error
     */
    throwIfNoResult?: boolean;
    /**
     * If the query is a transaction ({@link Transaction})
     */
    transaction?: Transaction;
}

/**
 * Interface Pagination option query
 */
export interface PaginationQueryOptions {
    /**
     * The limit of the query (default: 200)
     */
    limit?: number;

    /**
     * The offset of the query (default: 0)
     */
    offset?: number;
}

const globalErrorCodes: Record<string, number> = {
    [ErrorKeys.DATABASE_MODEL_NOT_CREATED]: 500,
    [ErrorKeys.DATABASE_MODEL_NOT_UPDATED]: 500,
    [ErrorKeys.DATABASE_MODEL_NOT_DELETED]: 500,
    [ErrorKeys.DATABASE_MODEL_NOT_FOUND]: 404
};

/**
 * Mapping of MSSQL error codes to HTTP status codes and message keys.
 * This table provides corresponding HTTP status codes and messages for common MSSQL errors,
 * useful in reflecting these in a Web API or REST service.
 */
export const mssqlErrorCodes: Record<number, { statusCode: number, messageKey: string }> = {
    /**
     * Connection Errors
     * - 4060: HTTP 403 Forbidden - Access to the requested resource, such as a database the user does not have access to, is denied.
     * - 18452: HTTP 403 Forbidden - The user does not have the necessary rights to access the resource.
     */
    4060: {
        statusCode: 403,
        messageKey: ErrorKeys.DATABASE_ACCESS_DENIED
    },
    18452: {
        statusCode: 403,
        messageKey: ErrorKeys.DATABASE_AUTHORIZATION_FAILED
    },
    /**
     * SQL Syntax Errors
     * - 102: HTTP 400 Bad Request - The request sent to the server contains incorrect syntax.
     * - 207: HTTP 400 Bad Request - Invalid request due to the use of a column that does not exist.
     * - 208: HTTP 404 Not Found - The specified table or view was not found in the database.
     * - 209: HTTP 400 Bad Request - Malformed request with ambiguous references in the column.
     */
    102: {
        statusCode: 400,
        messageKey: ErrorKeys.DATABASE_SYNTAX_ERROR
    },
    207: {
        statusCode: 400,
        messageKey: ErrorKeys.DATABASE_COLUMN_NOT_FOUND
    },
    208: {
        statusCode: 404,
        messageKey: ErrorKeys.DATABASE_TABLE_NOT_FOUND
    },
    209: {
        statusCode: 400,
        messageKey: ErrorKeys.DATABASE_AMBIGUOUS_COLUMN
    },
    /**
     * Data Integrity Errors
     * - 2627: HTTP 409 Conflict - The insert attempt failed because it would violate a uniqueness constraint (e.g., duplicate primary key).
     * - 547: HTTP 409 Conflict - The action attempt failed because it would violate a foreign key constraint.
     * - 2601: HTTP 409 Conflict - Conflict due to inserting duplicate data that does not comply with a unique index constraint.
     */
    2627: {
        statusCode: 409,
        messageKey: ErrorKeys.DATABASE_DUPLICATE_KEY
    },
    547: {
        statusCode: 409,
        messageKey: ErrorKeys.DATABASE_FOREIGN_KEY_VIOLATION
    },
    2601: {
        statusCode: 409,
        messageKey: ErrorKeys.DATABASE_UNIQUE_CONSTRAINT_VIOLATION
    },
    /**
     * Transaction Management Errors
     * - 1205: HTTP 409 Conflict - Conflict detected between multiple concurrent transactions, resulting in a deadlock.
     * - 1222: HTTP 503 Service Unavailable - The requested resource is locked and thus temporarily inaccessible.
     * - 3928: HTTP 500 Internal Server Error - Internal server error that led to the cancellation of the transaction.
     */
    1205: {
        statusCode: 409,
        messageKey: ErrorKeys.DATABASE_DEADLOCK_DETECTED
    },
    1222: {
        statusCode: 503,
        messageKey: ErrorKeys.DATABASE_RESOURCE_LOCK
    },
    3928: {
        statusCode: 500,
        messageKey: ErrorKeys.DATABASE_TRANSACTION_ABORTED
    },
    /**
     * Performance and Resource Errors
     * - 701: HTTP 503 Service Unavailable - The server cannot respond to the request due to insufficient system resources (memory).
     * - 1105: HTTP 507 Insufficient Storage - The server cannot complete the request due to lack of disk space.
     * - 8645: HTTP 504 Gateway Timeout - The request took too long to execute, resulting in a timeout.
     */
    701: {
        statusCode: 503,
        messageKey: ErrorKeys.DATABASE_INSUFFICIENT_MEMORY
    },
    1105: {
        statusCode: 507,
        messageKey: ErrorKeys.DATABASE_INSUFFICIENT_STORAGE
    },
    8645: {
        statusCode: 504,
        messageKey: ErrorKeys.DATABASE_QUERY_TIMEOUT
    },
    /**
     * General Errors
     * - 9002: HTTP 507 Insufficient Storage - The space for storing transactions is exhausted.
     * - 8152: HTTP 400 Bad Request - The size of the data sent exceeds the limits defined by the database.
     */
    9002: {
        statusCode: 507,
        messageKey: ErrorKeys.DATABASE_TRANSACTION_LOG_FULL
    },
    8152: {
        statusCode: 400,
        messageKey: ErrorKeys.DATABASE_DATA_TOO_LARGE
    },
    /**
     * Access or Security Errors
     * - 229: HTTP 403 Forbidden - The user does not have the necessary permissions to access the resource.
     */
    229: {
        statusCode: 403,
        messageKey: ErrorKeys.DATABASE_PERMISSION_DENIED
    }
};

/**
 * Abstract Repository Interface
 *
 * @typeparam T - The data type representing the table model (interface representing the table schema).
 */
export abstract class AbstractRepository<T> {
    /**
     * The name of the table.
     */
    protected readonly _table: string;

    /**
     * The name of the database.
     */
    protected readonly _databaseName: string;

    /**
     * The database instance. ({@link Knex})
     */
    protected readonly _database: Knex;

    /**
     * The primary key for the table. The first element is the key name, and the second element is the key type.
     *
     * If undefined, defaults to ['id', 'NUMBER'].
     *
     * @typeParam T - The data type representing the table model.
     *
     * @example
     * primaryKey: ['uuid', 'STRING']
     */
    protected readonly _primaryKey: [keyof T, 'NUMBER' | 'STRING'];

    /**
     * Constructs an instance of the abstract repository. ({@link AbstractRepository})
     *
     * @param table - The name of the table.
     * @param databaseName - The name of the database.
     * @param primaryKey - The primary key of the table (optional, default: ['id', 'NUMBER']).
     *
     * @throws ({@link CoreError}) - If the database is not found. ({@link ErrorKeys.DATABASE_NOT_REGISTERED})
     */
    protected constructor(
        table: string,
        databaseName: string,
        primaryKey?: [keyof T, 'NUMBER' | 'STRING']
    ) {
        this._table = table;
        this._databaseName = databaseName;
        this._database = FactoryDatabase.get(databaseName);
        this._primaryKey = primaryKey ?? ['id', 'NUMBER'] as [keyof T, 'NUMBER'];
    }

    /**
     * Gets the table name.
     *
     * @returns The name of the table.
     */
    public get table(): string {
        return this._table;
    }

    /**
     * Gets the database name.
     *
     * @returns The name of the database.
     */
    public get databaseName(): string {
        return this._databaseName;
    }

    /**
     * Gets the primary key of the table.
     *
     * @returns The primary key of the table. ([keyof T, 'NUMBER' | 'STRING'])
     */
    public get primaryKey(): [keyof T, 'NUMBER' | 'STRING'] {
        return this._primaryKey;
    }

    /**
     * Gets the database instance.
     *
     * @returns The database instance. ({@link Knex})
     */
    public get database(): Knex {
        return this._database;
    }

    /**
     * Inserts the data into the table.
     *
     * @param data - Data to be inserted. ({@link Partial})
     * @param columns - Columns to be selected in the query. ({@link ColumnsSelection})
     * @param options - Query options to be applied to the query. ({@link QueryOptions})
     *
     * @throws ({@link CoreError}) - If the query not created and an error occurred. ({@link ErrorKeys.DATABASE_MODEL_NOT_CREATED})
     * @throws ({@link CoreError}) - If the query can throw an error and an error occurred. ({@link ErrorKeys.DATABASE_QUERY_ERROR})
     *
     * @returns The data inserted into the table. ({@link Partial})
     */
    public async insert(
        data: Partial<T> | Partial<T>[],
        columns?: ColumnsSelection<T>,
        options?: QueryOptions
    ): Promise<Partial<T>[] | void> {
        return this._executeQuery(
            this._database(this._table)
                .insert(data)
                .returning(this._transformColumnObjectToArray(columns)),
            ErrorKeys.DATABASE_MODEL_NOT_CREATED,
            options
        ) as Promise<Partial<T>[] | void>;
    }

    /**
     * Finds the rows based on the search options.
     *
     * @param search - Search options to be applied to the query. ({@link SearchModel})
     * @param columns - Columns to be selected in the query. ({@link ColumnsSelection})
     * @param options - Query options to be applied to the query. ({@link QueryOptions})
     *
     * @throws ({@link CoreError}) - If the no result is found and an error occurred. ({@link ErrorKeys.DATABASE_MODEL_NOT_FOUND})
     * @throws ({@link CoreError}) - If the query can throw an error and an error occurred. ({@link ErrorKeys.DATABASE_QUERY_ERROR})
     *
     * @returns The data found based on the search options. ({@link Partial})
     */
    public async find(
        search?: SearchModel<T> | SearchModel<T>[],
        columns?: ColumnsSelection<T>,
        options?: QueryOptions & PaginationQueryOptions & { first?: boolean }
    ): Promise<Partial<T> | Partial<T>[] | void> {
        let query = this._database(this._table)
            .select(this._transformColumnObjectToArray(columns));

        query = this._applySearch(query, search);
        query = this._applyPagination(query, options);

        return this._executeQuery(query, ErrorKeys.DATABASE_MODEL_NOT_FOUND, options);
    }

    /**
     * Updates the rows based on the search options.
     *
     * @param data - Data to be updated. ({@link Partial})
     * @param search - Search options to be applied to the query. ({@link SearchModel})
     * @param columns - Columns to be selected in the query. ({@link ColumnsSelection})
     * @param options - Query options to be applied to the query. ({@link QueryOptions})
     *
     * @throws ({@link CoreError}) - If no rows are updated and an error occurred. ({@link ErrorKeys.DATABASE_MODEL_NOT_UPDATED})
     * @throws ({@link CoreError}) - If the query can throw an error and an error occurred. ({@link ErrorKeys.DATABASE_QUERY_ERROR})
     *
     * @returns The data updated based on the search options. ({@link Partial})
     */
    public async update(
        data: Partial<T>,
        search?: SearchModel<T> | SearchModel<T>[],
        columns?: ColumnsSelection<T>,
        options?: QueryOptions
    ): Promise<Partial<T>[] | void> {
        return this._executeQuery(
            this._applySearch(
                this._database(this._table)
                    .update(data)
                    .returning(this._transformColumnObjectToArray(columns)),
                search
            ),
            ErrorKeys.DATABASE_MODEL_NOT_UPDATED,
            options
        ) as Promise<Partial<T>[] | void>;
    }

    /**
     * Deletes the rows based on the search options.
     *
     * @param search - Search options to be applied to the query. ({@link SearchModel})
     * @param columns - Columns to be selected in the query. ({@link ColumnsSelection})
     * @param options - Query options to be applied to the query. ({@link QueryOptions})
     *
     * @throws ({@link CoreError}) - If no rows are deleted and an error occurred. ({@link ErrorKeys.DATABASE_MODEL_NOT_DELETED})
     * @throws ({@link CoreError}) - If the query can throw an error and an error occurred. ({@link ErrorKeys.DATABASE_QUERY_ERROR})
     *
     * @returns The data deleted based on the search options. ({@link Partial})
     */
    public async delete(
        search?: SearchModel<T> | SearchModel<T>[],
        columns?: ColumnsSelection<T>,
        options?: QueryOptions
    ): Promise<Partial<T>[] | void> {
        return this._executeQuery(
            this._applySearch(
                this._database(this._table)
                    .delete()
                    .returning(this._transformColumnObjectToArray(columns)),
                search
            ),
            ErrorKeys.DATABASE_MODEL_NOT_DELETED,
            options
        ) as Promise<Partial<T>[] | void>;
    }

    /**
     * Counts the number of rows based on the search options.
     *
     * @param search - Search options to be applied to the query. ({@link SearchModel})
     * @param options - Query options to be applied to the query. ({@link QueryOptions})
     *
     * @throws ({@link CoreError}) - If the query can throw an error and an error occurred. ({@link ErrorKeys.DATABASE_QUERY_ERROR})
     *
     * @returns The number of rows affected by the query.
     */
    public async count(
        search?: SearchModel<T> | SearchModel<T>[],
        options?: Pick<QueryOptions, 'transaction'>
    ): Promise<number | void> {
        let query = this._applySearch(
            this._database(this._table)
                .count({ count: '*' }),
            search
        );
        if (options?.transaction)
            query = query.transacting(options.transaction);

        return query
            .then((result) => result[0]?.count as number ?? 0)
            .catch((error: unknown) => (this._handleError(error) === undefined ? 0 : 0));
    }

    /**
     * Transforms the column object to an array
     *
     * @param columns - The columns object to be transformed to an array. ({@link ColumnsSelection})
     *
     * @returns The columns array. (string[])
     */
    protected _transformColumnObjectToArray<K>(columns?: ColumnsSelection<K>): string[] {
        if (!columns || Object.keys(columns).length === 0) return ['*'];
        return Object.entries(columns)
            .filter(
                ([, value]) => (typeof value === 'boolean' && value)
                    || (typeof value === 'string' && value.length > 0)
            )
            .map(([key, value]): string => (typeof value === 'string' ? value : key));
    }

    /**
     * Handles the error thrown during query execution
     *
     * @param error - The error to be handled
     *
     * @throws ({@link CoreError}) - If the query can throw an error and an error occurred. ({@link ErrorKeys.DATABASE_QUERY_ERROR})
     */
    protected _handleError(error: unknown): undefined | void {
        if (error instanceof CoreError) {
            throw error;
        } else {
            const number = (error as { number: number })?.number;
            const statusCode = mssqlErrorCodes[number]?.statusCode ?? 500;
            const messageKey = mssqlErrorCodes[number]?.messageKey ?? ErrorKeys.DATABASE_QUERY_ERROR;

            throw new CoreError({
                code: statusCode,
                messageKey,
                detail: {
                    table: this._table,
                    database: this._databaseName,
                    ...(messageKey === ErrorKeys.DATABASE_QUERY_ERROR && { driver: { code: number } })
                }
            });
        }
    }

    /**
     * Handles the result of the query execution
     *
     * @param result - The result of the query execution. ({@link Partial})
     * @param messageKey - The key of the error message to be thrown when no result is found
     * @param throwIfNoResult - A boolean value to determine if an error should be thrown when no result is found
     *
     * @throws ({@link CoreError}) - If the query can throw an error and an error occurred ({@link messageKey})
     *
     * @returns The result of the query execution. ({@link Partial})
     */
    protected _handleResult<K>(
        result: Partial<K> | Partial<K>[],
        messageKey: string,
        throwIfNoResult = false
    ): Partial<K> | Partial<K>[] | void {
        if (Array.isArray(result)) {
            if (result.length === 0 && throwIfNoResult)
                this._throwNoResultError(messageKey);
            return result;
        }
        if (!result && throwIfNoResult)
            this._throwNoResultError(messageKey);
        return result;
    }

    /**
     * Applies the search options to the query
     *
     * @param query - The query to be applied with the search options. ({@link Knex.QueryBuilder})
     * @param search - The search options to be applied to the query. ({@link SearchModel})
     *
     * @returns The query applied with the search options. ({@link Knex.QueryBuilder})
     */
    protected _applySearch<K>(
        query: Knex.QueryBuilder,
        search?: SearchModel<K> | SearchModel<K>[]
    ): Knex.QueryBuilder {
        if (!search) return query;
        if (Array.isArray(search))
            return search.reduce(
                (builder, search) => this._buildSearchQuery(builder, search),
                query
            );

        return this._buildSearchQuery(query, search);
    }

    /**
     * Executes the query and handles the result or error
     *
     * @param query - The query to be executed. ({@link Knex.QueryBuilder})
     * @param messageKey - The key of the error message to be thrown when no result is found
     * @param options - The options to be applied to the query. ({@link QueryOptions})
     *
     * @throws ({@link CoreError}) - If the query can throw an error and an error occurred ({@link messageKey})
     * @throws ({@link CoreError}) - If the query can throw an error and an error occurred. ({@link ErrorKeys.DATABASE_QUERY_ERROR})
     *
     * @returns The result of the query execution. ({@link Partial})
     */
    protected _executeQuery<K>(
        query: Knex.QueryBuilder,
        noResultKey: string,
        options?: QueryOptions
    ): Promise<Partial<K>[] | Partial<K> | void> {
        if (options?.transaction) query = query.transacting(options.transaction);

        return query
            .then((result) => this._handleResult(result as Partial<K>[] | Partial<K>, noResultKey, options?.throwIfNoResult))
            .catch((error: unknown) => this._handleError(error));
    }

    /**
     * Applies the pagination options to the query
     *
     * @param query - The query to be applied with the pagination options. ({@link Knex.QueryBuilder})
     * @param options - The pagination options to be applied to the query. ({@link PaginationQueryOptions})
     *
     * @returns The query applied with the pagination options. ({@link Knex.QueryBuilder})
     */
    protected _applyPagination(
        query: Knex.QueryBuilder,
        options?: PaginationQueryOptions & { first?: boolean }
    ): Knex.QueryBuilder {
        if (options?.first) query = query.first();
        if (options?.limit ?? options?.offset) {
            query = query.orderBy(`${this._table}.${(this._primaryKey[0] as string)}`, 'asc');
            if (options?.limit) query = query.limit(options.limit);
            if (options?.offset) query = query.offset(options.offset);
        }
        return query;
    }

    /**
     * Checks if the given string is potentially a date
     *
     * @param date - The string to be checked if it is a date or not
     *
     * @returns A boolean value to determine if the string is a date or not
     */
    private _isDate(date: string): boolean {
        return new Date(date).toString() !== 'Invalid Date';
    }

    /**
     * Builds and applies a complex query to the given query builder.
     *
     * This method iterates over each key-value pair in the `searchItem` object and applies the corresponding filter conditions
     * to the SQL query. If the value associated with a key is a complex object (e.g., `{ $eq: 10, $in: [1, 2, 3] }`),
     * it applies operators such as `$in`, `$eq`, `$lt`, etc. to build a more sophisticated query.
     * For a simple value, it applies a `WHERE` or `OR WHERE` condition depending on the context.
     *
     * Supported operators include:
     * - `$in`: equivalent to SQL `IN`.
     * - `$nin`: equivalent to SQL `NOT IN`.
     * - `$eq`: equivalent to SQL `=` (equality).
     * - `$neq`: equivalent to SQL `<>` (not equal).
     * - `$match`: partial matching, equivalent to SQL `LIKE`.
     * - `$lt`, `$lte`: less than or less than or equal to.
     * - `$gt`, `$gte`: greater than or greater than or equal to.
     * - `$isNotNull`, `$isNull`: equivalent to SQL `IS NOT NULL` and `IS NULL`, respectively
     *
     * If the query starts with an OR clause (`orWhere`), the first condition is treated as such,
     * and subsequent conditions are chained with `AND` or `OR` accordingly.
     *
     * @typeparam K - The generic type representing the keys of the search model.
     *
     * @param query - The query object to which the complex query will be applied. ({@link Knex.QueryBuilder})
     * @param searchItem - The object containing search criteria. Each key represents a column,
     * and each value can be a simple condition or a complex condition (e.g., $eq, $in, $lt, etc.). ({@link SearchModel})
     *
     * @returns The updated query builder with the applied search conditions. ({@link Knex.QueryBuilder})
     */
    private _buildSearchQuery<K>(query: Knex.QueryBuilder, searchItem: SearchModel<K>): Knex.QueryBuilder {
        let firstIsOrQuery = true;

        type OperatorFunction = (query: Knex.QueryBuilder, key: string, value: unknown) => Knex.QueryBuilder;

        const keysFunc: Record<keyof WhereClause, OperatorFunction> = {
            $in: (query, key, value) => (
                firstIsOrQuery
                    ? query.orWhereIn(key, value as string[] | number[] | Date[])
                    : query.whereIn(key, value as string[] | number[] | Date[])
            ),
            $nin: (query, key, value) => (
                firstIsOrQuery
                    ? query.orWhereNotIn(key, value as string[] | number[] | Date[])
                    : query.whereNotIn(key, value as string[] | number[] | Date[])
            ),
            $eq: (query, key, value) => (
                firstIsOrQuery
                    ? query.orWhere(key, value as string | number | boolean | Date)
                    : query.where(key, value as string | number | boolean | Date)
            ),
            $neq: (query, key, value) => (
                firstIsOrQuery
                    ? query.orWhereNot(key, value as string | number | boolean | Date)
                    : query.whereNot(key, value as string | number | boolean | Date)
            ),
            $lt: (query, key, value) => (
                firstIsOrQuery
                    ? query.orWhere(key, '<', value as string | number | Date)
                    : query.where(key, '<', value as string | number | Date)
            ),
            $lte: (query, key, value) => (
                firstIsOrQuery
                    ? query.orWhere(key, '<=', value as string | number | Date)
                    : query.where(key, '<=', value as string | number | Date)
            ),
            $gt: (query, key, value) => (
                firstIsOrQuery
                    ? query.orWhere(key, '>', value as string | number | Date)
                    : query.where(key, '>', value as string | number | Date)
            ),
            $gte: (query, key, value) => (
                firstIsOrQuery
                    ? query.orWhere(key, '>=', value as string | number | Date)
                    : query.where(key, '>=', value as string | number | Date)
            ),
            $isNull: (query, key) => (
                firstIsOrQuery
                    ? query.orWhereNull(key)
                    : query.whereNull(key)
            ),
            $isNotNull: (query, key) => (
                firstIsOrQuery
                    ? query.orWhereNotNull(key)
                    : query.whereNotNull(key)
            ),
            $match: (query, key, value) => {
                const likeValue = `%${value}%`;
                if (this._isDate(value as string)) {
                    const { client } = this._database.client.config;
                    if (client === 'mssql')
                        return query.whereRaw(`CONVERT(VARCHAR, ${key}, 23) LIKE ?`, [likeValue]);
                    return query.whereRaw(`CAST(${key} AS VARCHAR) LIKE ?`, [likeValue]);
                }
                return firstIsOrQuery
                    ? query.orWhereLike(key, likeValue)
                    : query.whereLike(key, likeValue);
            }
        };

        for (const [key, value] of Object.entries(searchItem))
            if (this._isComplexQuery(value)) {
                const whereClause = value as WhereClause;
                for (const [operator, opValue] of Object.entries(whereClause))
                    if (operator in keysFunc) {
                        const func = keysFunc[operator as keyof WhereClause];
                        query = func(query, key, opValue);
                        firstIsOrQuery = false;
                    }
            } else {
                if (typeof value === 'object' && Object.keys(value).length === 0) continue;
                query = firstIsOrQuery
                    ? query.orWhere(key, value)
                    : query.where(key, value);
                firstIsOrQuery = false;
            }
        return query;
    }

    /**
     * Determines whether the provided data object contains a complex query.
     *
     * @param data - The data to be checked, which can be of any type.
     *
     * @returns Returns `true` if the data is an object and contains one or more valid query operators, otherwise returns `false`.
     */
    private _isComplexQuery(data: unknown): boolean {
        const validKeys = new Set<string>(['$in', '$nin', '$eq', '$neq', '$match', '$lt', '$lte', '$gt', '$gte', '$isNotNull', '$isNull']);
        return Boolean(
            data
            && typeof data === 'object'
            && !Array.isArray(data)
            && Object.keys(data).some((key) => validKeys.has(key))
        );
    }

    /**
     * Throws an error when no result is found
     *
     * @param messageKey - The key of the error message to be thrown
     *
     * @throws ({@link CoreError}) - If the query can throw an error and an error occurred ({@link messageKey})
     */
    private _throwNoResultError(messageKey: string): void {
        throw new CoreError({
            code: globalErrorCodes[messageKey] ?? 500,
            messageKey,
            detail: { table: this._table, database: this._databaseName }
        });
    }
}

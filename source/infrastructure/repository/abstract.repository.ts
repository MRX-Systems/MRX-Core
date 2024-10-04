import type { Knex } from 'knex';

import { CoreError, ErrorKeys } from '#/common/error/index.ts';
import type {
    ColumnsSelection,
    OptionalModel,
    SearchModel,
    Transaction,
    WhereClause,
    WhereClauseFilter
} from '#/common/types/index.ts';
import { FactoryDatabase } from '#/infrastructure/database/index.ts';

/**
 * Interface Option query
 */
export interface QueryOptions {
    /**
     * If the query does not return any result, throw an error
     */
    throwIfNoResult?: boolean;
    /**
     * If the query can throw an error
     */
    throwIfQueryError?: boolean;
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

/**
 * Interface Abstract Repository
 *
 * @typeparam T - The type of the data. (Is the table model (interface to represent the table))
 */
export abstract class AbstractRepository<T> {
    /**
     * The table name.
     */
    protected readonly _table: string;
    /**
     * The database name.
     */
    protected readonly _databaseName: string;
    /**
     * The database instance. ({@link Knex})
     */
    protected readonly _database: Knex;
    /**
     * The primary key for the table.
     * The first element is the key name and the second element is the key type.
     *
     * Undefined uses the default primary key. (id, NUMBER)
     *
     * @typeParam T - The type of the data. (Is the table model (interface to represent the table))
     *
     * @example
     *
     * primaryKey: ['uuid', 'STRING']
     */
    protected readonly _primaryKey: [keyof T, 'NUMBER' | 'STRING'];

    /**
     * Creates an instance of the abstract repository. ({@link AbstractRepository})
     *
     * @param table - The name of the table.
     * @param databaseName - The name of the database.
     * @param primaryKey - The primary key of the table. (default: ['id', 'NUMBER'])
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
     * Returns the name of the table.
     *
     * @returns The name of the table.
     */
    public get table(): string {
        return this._table;
    }

    /**
     * Returns the name of the database.
     *
     * @returns The name of the database.
     */
    public get databaseName(): string {
        return this._databaseName;
    }

    /**
     * Returns the primary key of the table.
     *
     * @returns The primary key of the table. ([keyof T, 'NUMBER' | 'STRING'])
     */
    public get primaryKey(): [keyof T, 'NUMBER' | 'STRING'] {
        return this._primaryKey;
    }

    /**
     * Returns the database instance.
     *
     * @returns The database instance. ({@link Knex})
     */
    public get database(): Knex {
        return this._database;
    }

    /**
     * Inserts the data into the table.
     *
     * @param data - Data to be inserted. ({@link OptionalModel})
     * @param columns - Columns to be selected in the query. ({@link ColumnsSelection})
     * @param options - Query options to be applied to the query. ({@link QueryOptions})
     *
     * @throws ({@link CoreError}) - If the query can throw an error and an error occurred ({@link noResultKey})
     * @throws ({@link CoreError}) - If the query can throw an error and an error occurred. ({@link ErrorKeys.DATABASE_QUERY_ERROR})
     *
     * @returns The data inserted into the table. ({@link OptionalModel})
     */
    public async insert(
        data: OptionalModel<T> | OptionalModel<T>[],
        columns?: ColumnsSelection<T>,
        options?: Partial<QueryOptions>
    ): Promise<OptionalModel<T>[] | void> {
        return this._executeQuery(
            this._database(this._table)
                .insert(data)
                .returning(this._transformColumnObjectToArray(columns)),
            ErrorKeys.DATABASE_MODEL_NOT_CREATED,
            options
        ) as Promise<OptionalModel<T>[] | void>;
    }

    /**
     * Finds the rows based on the search options.
     *
     * @param search - Search options to be applied to the query. ({@link SearchModel})
     * @param columns - Columns to be selected in the query. ({@link ColumnsSelection})
     * @param options - Query options to be applied to the query. ({@link QueryOptions})
     *
     * @throws ({@link CoreError}) - If the query can throw an error and an error occurred ({@link noResultKey})
     * @throws ({@link CoreError}) - If the query can throw an error and an error occurred. ({@link ErrorKeys.DATABASE_QUERY_ERROR})
     *
     * @returns The data found based on the search options. ({@link OptionalModel})
     */
    public async find(
        search?: SearchModel<T> | SearchModel<T>[],
        columns?: ColumnsSelection<T>,
        options?: Partial<QueryOptions> & Partial<PaginationQueryOptions> & { first?: boolean }
    ): Promise<OptionalModel<T> | OptionalModel<T>[] | void> {
        let query = this._database(this._table)
            .select(this._transformColumnObjectToArray(columns));

        query = this._applySearch(query, search);
        query = this._applyPagination(query, options);

        return this._executeQuery(query, ErrorKeys.DATABASE_MODEL_NOT_FOUND, options);
    }

    /**
     * Updates the rows based on the search options.
     *
     * @param data - Data to be updated. ({@link OptionalModel})
     * @param search - Search options to be applied to the query. ({@link SearchModel})
     * @param columns - Columns to be selected in the query. ({@link ColumnsSelection})
     * @param options - Query options to be applied to the query. ({@link QueryOptions})
     *
     * @throws ({@link CoreError}) - If the query can throw an error and an error occurred ({@link noResultKey})
     * @throws ({@link CoreError}) - If the query can throw an error and an error occurred. ({@link ErrorKeys.DATABASE_QUERY_ERROR})
     *
     * @returns The data updated based on the search options. ({@link OptionalModel})
     */
    public async update(
        data: OptionalModel<T>,
        search?: SearchModel<T> | SearchModel<T>[],
        columns?: ColumnsSelection<T>,
        options?: Partial<QueryOptions>
    ): Promise<OptionalModel<T>[] | void> {
        return this._executeQuery(
            this._applySearch(
                this._database(this._table)
                    .update(data)
                    .returning(this._transformColumnObjectToArray(columns)),
                search
            ),
            ErrorKeys.DATABASE_MODEL_NOT_UPDATED,
            options
        ) as Promise<OptionalModel<T>[] | void>;
    }

    /**
     * Deletes the rows based on the search options.
     *
     * @param search - Search options to be applied to the query. ({@link SearchModel})
     * @param columns - Columns to be selected in the query. ({@link ColumnsSelection})
     * @param options - Query options to be applied to the query. ({@link QueryOptions})
     *
     * @throws ({@link CoreError}) - If the query can throw an error and an error occurred ({@link noResultKey})
     * @throws ({@link CoreError}) - If the query can throw an error and an error occurred. ({@link ErrorKeys.DATABASE_QUERY_ERROR})
     *
     * @returns The data deleted based on the search options. ({@link OptionalModel})
     */
    public async delete(
        search?: SearchModel<T> | SearchModel<T>[],
        columns?: ColumnsSelection<T>,
        options?: Partial<QueryOptions>
    ): Promise<OptionalModel<T>[] | void> {
        return this._executeQuery(
            this._applySearch(
                this._database(this._table)
                    .delete()
                    .returning(this._transformColumnObjectToArray(columns)),
                search
            ),
            ErrorKeys.DATABASE_MODEL_NOT_DELETED,
            options
        ) as Promise<OptionalModel<T>[] | void>;
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
        options?: Partial<QueryOptions>
    ): Promise<number | void> {
        const query = this._applySearch(
            this._database(this._table)
                .count({ count: '*' }),
            search
        );

        return query
            .then((result) => result[0]?.count as number ?? 0)
            .catch((error) => this._handleError(error, options?.throwIfQueryError) === undefined ? 0 : 0);
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
            .filter(([, value]) =>
                (typeof value === 'boolean' && value) ||
                    (typeof value === 'string' && value.length > 0)
            )
            .map(([key, value]): string => typeof value === 'string' ? value : key);
    }

    /**
     * Handles the error thrown during query execution
     *
     * @param error - The error to be handled
     * @param canThrow - A boolean value to determine if an error should be thrown
     *
     * @throws ({@link CoreError}) - If the query can throw an error and an error occurred. ({@link ErrorKeys.DATABASE_QUERY_ERROR})
     */
    protected _handleError(error: unknown, canThrow: boolean = true): undefined | void {
        if (canThrow)
            if (error instanceof CoreError)
                throw error;
            else
                throw new CoreError({
                    messageKey: ErrorKeys.DATABASE_QUERY_ERROR,
                    detail: {
                        table: this._table,
                        database: this._databaseName,
                        error
                    }
                });
        return undefined;
    }

    /**
     * Handles the result of the query execution
     *
     * @param result - The result of the query execution. ({@link OptionalModel})
     * @param noResultKey - The key of the error message to be thrown when no result is found
     * @param canThrow - A boolean value to determine if an error should be thrown when no result is found
     *
     * @throws ({@link CoreError}) - If the query can throw an error and an error occurred ({@link noResultKey})
     *
     * @returns The result of the query execution. ({@link OptionalModel})
     */
    protected _handleResult<K>(
        result: OptionalModel<K> | OptionalModel<K>[],
        noResultKey: string,
        canThrow: boolean = false
    ): OptionalModel<K> | OptionalModel<K>[] | void {
        if (Array.isArray(result)) {
            if (result.length === 0 && canThrow)
                this._throwNoResultError(noResultKey);
            return result;
        }
        if (!result && canThrow)
            this._throwNoResultError(noResultKey);
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
            return search.reduce((builder, data) =>
                this._isComplexQuery(data)
                    ? this._applyComplexQuery(builder, data as WhereClauseFilter<K>)
                    : builder.orWhere(data as OptionalModel<K>), query);
        return this._isComplexQuery(search)
            ? this._applyComplexQuery(query, search as WhereClauseFilter<K>)
            : query.where(search as OptionalModel<K>);
    }

    /**
     * Executes the query and handles the result or error
     *
     * @param query - The query to be executed. ({@link Knex.QueryBuilder})
     * @param noResultKey - The key of the error message to be thrown when no result is found
     * @param options - The options to be applied to the query. ({@link QueryOptions})
     *
     * @throws ({@link CoreError}) - If the query can throw an error and an error occurred ({@link noResultKey})
     * @throws ({@link CoreError}) - If the query can throw an error and an error occurred. ({@link ErrorKeys.DATABASE_QUERY_ERROR})
     *
     * @returns The result of the query execution. ({@link OptionalModel})
     */
    protected _executeQuery<K>(
        query: Knex.QueryBuilder,
        noResultKey: string,
        options?: Partial<QueryOptions>
    ): Promise<OptionalModel<K>[] | OptionalModel<K> | void> {
        if (options?.transaction) query = query.transacting(options.transaction);

        return query
            .then((result) => this._handleResult(result as OptionalModel<K>[] | OptionalModel<K>, noResultKey, options?.throwIfNoResult))
            .catch((error) => this._handleError(error, options?.throwIfQueryError));
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
        options?: Partial<PaginationQueryOptions> & { first?: boolean }
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
     * Applies the complex query to the query
     *
     * @param query - The query to be applied with the complex query. ({@link Knex.QueryBuilder})
     * @param complexQuery - The complex query to be applied to the query. ({@link WhereClauseFilter})
     *
     * @returns The query applied with the complex query. ({@link Knex.QueryBuilder})
     */
    private _applyComplexQuery<K>(query: Knex.QueryBuilder, complexQuery: WhereClauseFilter<K>): Knex.QueryBuilder {
        Object.entries(complexQuery).forEach(([key, value]) => {
            const whereClause: WhereClause = value as WhereClause;
            if ('$in' in whereClause)
                query = query.orWhereIn(key, whereClause.$in);
            if ('$nin' in whereClause)
                query = query.orWhereNotIn(key, whereClause.$nin);
            if ('$eq' in whereClause)
                query = query.andWhere(key, whereClause.$eq);
            if ('$neq' in whereClause)
                query = query.andWhereNot(key, whereClause.$neq);
            if ('$match' in whereClause)
                query = query.andWhereLike(key, `%${whereClause.$match}%`);
            if ('$lt' in whereClause)
                query = query.andWhere(key, '<', whereClause.$lt);
            if ('$lte' in whereClause)
                query = query.andWhere(key, '<=', whereClause.$lte);
            if ('$gt' in whereClause)
                query = query.andWhere(key, '>', whereClause.$gt);
            if ('$gte' in whereClause)
                query = query.andWhere(key, '>=', whereClause.$gte);
        });
        return query;
    }

    /**
     * Checks if the data is a complex query or not
     *
     * @param data - The data to be checked if it is a complex query or not. ({@link SearchModel})
     *
     * @returns A boolean value to determine if the data is a complex query or not
     */
    private _isComplexQuery<K>(data: SearchModel<K>): boolean {
        const validKeys: Set<string> = new Set(['$in', '$nin', '$eq', '$neq', '$match', '$lt', '$lte', '$gt', '$gte']);
        return Object.values(data).some((value: Record<string, unknown>) =>
            value && typeof value === 'object' && Object.keys(value).every(key => validKeys.has(key))
        );
    }

    /**
     * Throws an error when no result is found
     *
     * @param noResultKey - The key of the error message to be thrown
     *
     * @throws ({@link CoreError}) - If the query can throw an error and an error occurred ({@link noResultKey})
     */
    private _throwNoResultError(noResultKey: string): void {
        throw new CoreError({
            messageKey: noResultKey,
            detail: { table: this._table, database: this._databaseName }
        });
    }
}

import type { Knex } from 'knex';

import { InfrastructureDatabaseKeys } from '@/Common/Error/Enum/InfrastructureDatabaseKeys.js';
import { AndesiteError } from '@/Common/Error/index.js';
import type { IPaginationOptionQueryDTO, IWhereClauseDTO } from '@/DTO/index.js';
import { FactoryDatabase } from '@/Infrastructure/Database/FactoryDatabase.js';
import type { Transaction } from '@/Infrastructure/Database/index.js';

/**
 * Interface Option query
 */
export interface IOptionQuery {
    /**
     * If the query does not return any result, throw an error
     */
    throwIfNoResult?: boolean;
    /**
     * If the query can throw an error
     */
    throwIfQueryError?: boolean;
    /**
     * If the query is a transaction
     */
    transaction?: Transaction;
}

/**
 * Model class, allow to have CRUD operations on a table when extending this class.
 *
 * @typeparam T - The type of the data.
 */
export abstract class AbstractModel<T> {
    /**
     * Table name in database
     */
    protected readonly _table: string;

    /**
     * Database name
     */
    protected readonly _databaseName: string;

    /**
     * Database name to get in factory
     */
    protected readonly _database: Knex;

    /**
     * Primary key of table (default is ['id', 'NUMBER'])
     */
    protected readonly _primaryKey: [keyof T, 'NUMBER' | 'STRING'];

    /**
     * Get the table name
     *
     * @returns The table name
     */
    public get table(): string {
        return this._table;
    }

    /**
     * Get the database name
     *
     * @returns The database name
     */
    public get databaseName(): string {
        return this._databaseName;
    }

    /**
     * Get the primary key
     *
     * @returns The primary key of the table and the type of the primary key (Tuple of key and type)
     */
    public get primaryKey(): [keyof T, 'NUMBER' | 'STRING'] {
        return this._primaryKey;
    }

    /**
     * Get the database instance
     *
     * @returns The database instance ({@link Knex})
     */
    public get database(): Knex {
        return this._database;
    }

    /**
     * Constructor of the AbstractModel class, allow to have CRUD operations on a table when extending this class.
     *
     * @param table - Table name in database
     * @param databaseName - Database name to get in factory
     * @param primaryKey - Primary key of table (default is ['id', 'NUMBER'])
     *
     * @throws ({@link AndesiteError}) - If the database is not registered with the same name. ({@link InfrastructureDatabaseKeys.DATABASE_NOT_REGISTERED})
     * @throws ({@link AndesiteError}) - If the database is not connected ({@link InfrastructureDatabaseKeys.DATABASE_NOT_CONNECTED})
     */
    protected constructor(
        table: string,
        databaseName: string,
        primaryKey?: [keyof T, 'NUMBER' | 'STRING']
    ) {
        this._table = table;
        this._databaseName = databaseName;
        this._database = FactoryDatabase.instance.get(databaseName);
        this._primaryKey = primaryKey ?? ['id', 'NUMBER'] as [keyof T, 'NUMBER'];
    }

    /**
     * Add one or more data to the table in the database and return the added data
     *
     * @param data - Data to be created, it's an array of objects ({@link T})
     * @param columns - Columns to select, it's an object with the key as the column name and the value as a boolean to select or a string to alias the column ({@link T})
     * @param options - Query options ({@link IOptionQuery})
     *
     * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_QUERY_ERROR})
     * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_MODEL_NOT_CREATED})
     *
     * @returns The data returned from the query or void if an error occurred ({@link T})
     */
    public insert(
        data: Array<Partial<T>>,
        columns?: Partial<Record<keyof T, boolean | string>>,
        options?: IOptionQuery
    ): Promise<Array<Partial<T>> | void> {
        let query = this._database(this._table)
            .insert(data)
            .into(this._table)
            .returning(this._transformColumnObjectToArray(columns ?? {}));

        if (options?.transaction)
            query = query.transacting(options.transaction);

        return query
            .then((result) => this._handleArrayResult(result as Array<Partial<T>>, InfrastructureDatabaseKeys.DATABASE_MODEL_NOT_CREATED, options?.throwIfNoResult))
            .catch((error) => this._handleError(error, options?.throwIfQueryError));
    }

    /**
     * Find rows in the table based on equal or conditional entities
     *
     * @param search - Is the data used to find the data in the table ({@link T} | {@link IWhereClauseDTO})
     * @param columns - Columns to select is an object with the key is the column name and the value is a boolean to select or a string to alias the column. ({@link T})
     * @param options - Options of the query ({@link IOptionQuery} & {@link IPaginationOptionQueryDTO})
     *
     * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_QUERY_ERROR})
     * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_MODEL_NOT_FOUND})
     *
     * @returns The data returned from the query or void if an error occurred ({@link T})
     */
    public find(
        search: Array<Partial<T>> | Array<Partial<Record<keyof T, Partial<IWhereClauseDTO>>>>,
        columns?: Partial<Record<keyof T, boolean | string>>,
        options?: IOptionQuery & IPaginationOptionQueryDTO,
    ): Promise<Array<Partial<T>> | void>  {
        let query = this._database(this._table)
            .select(this._transformColumnObjectToArray(columns ?? {}))
            .from(this._table);
        query = this._queryBuilder(query, search);
        if (options?.limit ?? options?.offset)
            query = query.orderBy(this._primaryKey[0] as string, 'asc');
        if (options?.limit)
            query = query.limit(options.limit);
        if (options?.offset)
            query = query.offset(options.offset);
        if (options?.transaction)
            query = query.transacting(options.transaction);
        return query
            .then((result) => this._handleArrayResult(result as Array<Partial<T>>, InfrastructureDatabaseKeys.DATABASE_MODEL_NOT_FOUND, options?.throwIfNoResult))
            .catch((error) => this._handleError(error, options?.throwIfQueryError) === undefined ? [] : []);
    }

    /**
     * Find the first row in the table based on equal or conditional entities
     *
     * @param search - Is the data used to find the data in the table ({@link T} | {@link IWhereClauseDTO})
     * @param columns - Columns to select is an object with the key is the column name and the value is a boolean to select or a string to alias the column. ({@link T})
     * @param options - Options of the query ({@link IOptionQuery})
     *
     * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_QUERY_ERROR})
     * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_MODEL_NOT_FOUND})
     *
     * @returns The data returned from the query or void if an error occurred ({@link T})
     */
    public findOne(
        search: Array<Partial<T>> | Array<Partial<Record<keyof T, Partial<IWhereClauseDTO>>>>,
        columns?: Partial<Record<keyof T, boolean | string>>,
        options?: IOptionQuery
    ): Promise<Partial<T> | void> {
        let query = this._database(this._table)
            .first(this._transformColumnObjectToArray(columns ?? {}))
            .from(this._table);
        query = this._queryBuilder(query, search);
        if (options?.transaction)
            query = query.transacting(options.transaction);
        return query
            .then((result) => this._handleResult(result as Partial<T>, InfrastructureDatabaseKeys.DATABASE_MODEL_NOT_FOUND, options?.throwIfNoResult))
            .catch((error) => this._handleError(error, options?.throwIfQueryError));
    }

    /**
     * Find all rows in the table
     *
     * @param columns - Columns to select is an object with the key is the column name and the value is a boolean to select or a string to alias the column. ({@link T})
     * @param options - Options of the query ({@link IOptionQuery} & {@link IPaginationOptionQueryDTO})
     *
     * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_QUERY_ERROR})
     * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_MODEL_NOT_FOUND})
     *
     * @returns The data returned from the query or void if an error occurred ({@link T})
     */
    public findAll(
        columns?: Partial<Record<keyof T, boolean | string>>,
        options?: IOptionQuery & IPaginationOptionQueryDTO,
    ): Promise<Array<Partial<T>> | void> {
        let query = this._database(this._table)
            .select(this._transformColumnObjectToArray(columns ?? {}))
            .from(this._table);
        if (options?.limit ?? options?.offset)
            query = query.orderBy(this._primaryKey[0] as string, 'asc');
        if (options?.limit)
            query = query.limit(options.limit);
        if (options?.offset)
            query = query.offset(options.offset);
        if (options?.transaction)
            query = query.transacting(options.transaction);
        return query
            .then((result) => this._handleArrayResult(result as Array<Partial<T>>, InfrastructureDatabaseKeys.DATABASE_MODEL_NOT_FOUND, options?.throwIfNoResult))
            .catch((error) => this._handleError(error, options?.throwIfQueryError) === undefined ? [] : []);
    }

    /**
     * Update the data in the table based on equal or conditional entities
     *
     * @param data - Data to be updated, it's an object ({@link T})
     * @param search - Is the data used to find the data in the table ({@link T} | {@link IWhereClauseDTO})
     * @param columns - Columns to select is an object with the key is the column name and the value is a boolean to select or a string to alias the column. ({@link T})
     * @param options - Options of the query ({@link IOptionQuery})
     *
     * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_QUERY_ERROR})
     * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_MODEL_NOT_UPDATED})
     *
     * @returns The data returned from the query or void if an error occurred ({@link T})
     */
    public update(
        data: Partial<T>,
        search: Array<Partial<T>> | Array<Partial<Record<keyof T, Partial<IWhereClauseDTO>>>>,
        columns?: Partial<Record<keyof T, boolean | string>>,
        options?: IOptionQuery
    ): Promise<Array<Partial<T>> | void> {
        let query = this._database(this._table)
            .update(data)
            .from(this._table)
            .returning(this._transformColumnObjectToArray(columns ?? {}));

        query = this._queryBuilder(query, search);
        if (options?.transaction)
            query = query.transacting(options.transaction);
        return query
            .then((result) => this._handleArrayResult(result as Array<Partial<T>>, InfrastructureDatabaseKeys.DATABASE_MODEL_NOT_UPDATED, options?.throwIfNoResult))
            .catch((error) => this._handleError(error, options?.throwIfQueryError));
    }

    /**
     * Update all rows in the table
     *
     * @param data - Data to be updated, it's an object ({@link T})
     * @param columns - Columns to select is an object with the key is the column name and the value is a boolean to select or a string to alias the column. ({@link T})
     * @param options - Options of the query ({@link IOptionQuery})
     *
     * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_QUERY_ERROR})
     * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_MODEL_NOT_UPDATED})
     *
     * @returns The data returned from the query or void if an error occurred ({@link T})
     */
    public updateAll(
        data: Partial<T>,
        columns?: Partial<Record<keyof T, boolean | string>>,
        options?: IOptionQuery
    ): Promise<Array<Partial<T>> | void> {
        let query = this._database(this._table)
            .update(data)
            .from(this._table)
            .returning(this._transformColumnObjectToArray(columns ?? {}));
        if (options?.transaction)
            query = query.transacting(options.transaction);
        return query
            .then((result) => this._handleArrayResult(result as Array<Partial<T>>, InfrastructureDatabaseKeys.DATABASE_MODEL_NOT_UPDATED, options?.throwIfNoResult))
            .catch((error) => this._handleError(error, options?.throwIfQueryError));
    }

    /**
     * Delete the data in the table based on equal or conditional entities
     *
     * @param search - Is the data used to find the data in the table ({@link T} | {@link IWhereClauseDTO})
     * @param columns - Columns to select is an object with the key is the column name and the value is a boolean to select or a string to alias the column. ({@link T})
     * @param options - Options of the query ({@link IOptionQuery})
     *
     * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_QUERY_ERROR})
     * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_MODEL_NOT_DELETED})
     *
     * @returns The data returned from the query or void if an error occurred ({@link T})
     */
    public delete(
        search: Array<Partial<T>> | Array<Partial<Record<keyof T, Partial<IWhereClauseDTO>>>>,
        columns?: Partial<Record<keyof T, boolean | string>>,
        options?: IOptionQuery
    ): Promise<Array<Partial<T>> | void> {
        let query = this._database(this._table)
            .delete()
            .from(this._table)
            .returning(this._transformColumnObjectToArray(columns ?? {}));

        query = this._queryBuilder(query, search);
        if (options?.transaction)
            query = query.transacting(options.transaction);
        return query
            .then((result) => this._handleArrayResult(result as Array<Partial<T>>, InfrastructureDatabaseKeys.DATABASE_MODEL_NOT_DELETED, options?.throwIfNoResult))
            .catch((error) => this._handleError(error, options?.throwIfQueryError));
    }

    /**
     * Delete all rows in the table
     *
     * @param columns - Columns to select is an object with the key is the column name and the value is a boolean to select or a string to alias the column. ({@link T})
     * @param options - Options of the query ({@link IOptionQuery})
     *
     * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_QUERY_ERROR})
     * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_MODEL_NOT_DELETED})
     *
     * @returns The data returned from the query or void if an error occurred ({@link T})
     */
    public deleteAll(
        columns?: Partial<Record<keyof T, boolean | string>>,
        options?: IOptionQuery
    ): Promise<Array<Partial<T>> | void> {
        let query = this._database(this._table)
            .delete()
            .from(this._table)
            .returning(this._transformColumnObjectToArray(columns ?? {}));

        if (options?.transaction)
            query = query.transacting(options.transaction);
        return query
            .then((result) => this._handleArrayResult(result as Array<Partial<T>>, InfrastructureDatabaseKeys.DATABASE_MODEL_NOT_DELETED, options?.throwIfNoResult))
            .catch((error) => this._handleError(error, options?.throwIfQueryError));
    }

    /**
     * Count the number of results based on the search performed using equal or conditional entities
     *
     * @param search - The search data used to find the data in the table ({@link T} | {@link IWhereClauseDTO})
     * @param options - Query options ({@link IOptionQuery})
     *
     * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_QUERY_ERROR})
     *
     * @returns The number of results
     */
    public count(
        search: Array<Partial<T>> | Array<Partial<Record<keyof T, Partial<IWhereClauseDTO>>>>,
        options?: IOptionQuery
    ): Promise<number | void> {
        let query = this._database(this._table)
            .count('*')
            .from(this._table);
        query = this._queryBuilder(query, search);
        if (options?.transaction)
            query = query.transacting(options.transaction);
        return query
            .then((result) => parseInt(result[0]?.count?.toString() ?? '0', 10))
            .catch((error) => this._handleError(error, options?.throwIfQueryError) === undefined ? 0 : 0);
    }

    /**
     * Add a condition to the query builder
     *
     * @param query - Is the knex query builder ({@link Knex.QueryBuilder})
     * @param complexQuery - Is the data used for building the complex query ({@link IWhereClauseDTO})
     *
     * @returns The knex query builder ({@link Knex.QueryBuilder})
     */
    private _applyComplexQuery(query: Knex.QueryBuilder, complexQuery: Partial<Record<keyof T, IWhereClauseDTO>>): Knex.QueryBuilder {
        let builder = query;
        Object.entries(complexQuery).forEach(([key, value], index): void => {
            const whereClause: IWhereClauseDTO = (value as IWhereClauseDTO);
            if ('$in' in whereClause)
                builder = builder.orWhereIn(key, whereClause.$in);
            if ('$nin' in whereClause)
                builder = builder.orWhereNotIn(key, whereClause.$nin);
            if ('$eq' in whereClause)
                builder = index === 0 ? builder.orWhere(key, whereClause.$eq) : builder.andWhere(key, whereClause.$eq);
            if ('$neq' in whereClause)
                builder = index === 0 ? builder.orWhereNot(key, whereClause.$neq) : builder.andWhereNot(key, whereClause.$neq);
            if ('$match' in whereClause)
                builder = index === 0 ? builder.orWhereLike(key, `%${whereClause.$match}%`) : builder.andWhereLike(key, `%${whereClause.$match}%`);
            if ('$lt' in whereClause)
                builder = index === 0 ? builder.orWhere(key, '<', whereClause.$lt) : builder.andWhere(key, '<', whereClause.$lt);
            if ('$lte' in whereClause)
                builder = index === 0 ? builder.orWhere(key, '<=', whereClause.$lte) : builder.andWhere(key, '<=', whereClause.$lte);
            if ('$gt' in whereClause)
                builder = index === 0 ? builder.orWhere(key, '>', whereClause.$gt) : builder.andWhere(key, '>', whereClause.$gt);
            if ('$gte' in whereClause)
                builder = index === 0 ? builder.orWhere(key, '>=', whereClause.$gte) : builder.andWhere(key, '>=', whereClause.$gte);
        });
        return builder;
    }

    /**
     * Check if the data is a complex query
     *
     * @param data - Is the data to check if it's a complex query or not ({@link T} | {@link IWhereClauseDTO})
     *
     * @returns If the data is a complex query or not return a boolean
     */
    private _isComplexQuery(data: Partial<T> | Partial<Record<keyof T, Partial<IWhereClauseDTO>>>): boolean {
        const validKeys: Set<string> = new Set(['$in', '$nin', '$eq', '$neq', '$match', '$lt', '$lte', '$gt', '$gte']);
        return Object.values(data).some(value =>
            value && typeof value === 'object' && Object.keys(value).every(key => validKeys.has(key))
        );
    }

    /**
     * Create the query builder
     *
     * @param query - Is the knex query builder ({@link Knex.QueryBuilder})
     * @param search - Is the data used for building the query ({@link T} | {@link IWhereClauseDTO})
     *
     * @returns The knex query builder ({@link Knex.QueryBuilder})
     */
    protected _queryBuilder(
        query: Knex.QueryBuilder,
        search: Array<Partial<T>> | Array<Partial<Record<keyof T, Partial<IWhereClauseDTO>>>>
    ): Knex.QueryBuilder {
        return search.reduce((builder, data) => this._isComplexQuery(data)
            ? this._applyComplexQuery(builder, data as Partial<Record<keyof T, IWhereClauseDTO>>)
            : builder.where(data as Partial<T>), query);
    }

    /**
     * Create an array of the column to select
     *
     * @param columns - Columns to select is an object with the key is the column name and the value is a boolean to select or a string to alias the column. ({@link K})
     *
     * @returns The array of columns to select
     */
    protected _transformColumnObjectToArray<K>(columns: Partial<Record<keyof K, boolean | string>>): string[] {
        const entries = Object.entries(columns);
        if (entries.length === 0)
            return ['*'];
        return entries
            .filter(([, value]) =>
                (typeof value === 'boolean' && value) ||
                (typeof value === 'string' && value.length > 0)
            )
            .map(([key, value]): string => typeof value === 'string' ? value : key);
    }

    /**
     * Handle the error of the query
     *
     * @param error - Is the error to handle
     * @param canThrow - If the _handleError can throw an error to the caller (default is true)
     *
     * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_QUERY_ERROR})
     * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link InfrastructureDatabaseKeys.DATABASE_MODEL_NOT_CREATED} | {@link InfrastructureDatabaseKeys.DATABASE_MODEL_NOT_FOUND} | {@link InfrastructureDatabaseKeys.DATABASE_MODEL_NOT_UPDATED} | {@link InfrastructureDatabaseKeys.DATABASE_MODEL_NOT_DELETED})
     *
     * @returns The data returned from the query or void if an error occurred ({@link T})
     */
    protected _handleError(error: unknown, canThrow: boolean = true): undefined | void {
        if (canThrow)
            if (error instanceof AndesiteError)
                throw error;
            else
                throw new AndesiteError({
                    messageKey: InfrastructureDatabaseKeys.DATABASE_QUERY_ERROR,
                    detail: {
                        table: this._table,
                        database: this._databaseName,
                        error
                    }
                });
        return undefined;
    }

    /**
     * Handle the result of the query
     *
     * @param result - Is the result of the query to handle
     * @param noResultKey - Is the key of the message to throw if the result is empty
     * @param canThrow - If the _handleResult can throw an error to the caller (default is true)
     *
     * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link noResultKey})
     *
     * @returns The data returned from the query or void if an error occurred ({@link T})
     */
    protected _handleArrayResult(
        result: Array<Partial<T>>,
        noResultKey: string,
        canThrow: boolean = true
    ): Array<Partial<T>> | void {
        if (result.length === 0 && canThrow)
            throw new AndesiteError({
                messageKey: noResultKey,
                detail: { table: this._table, database: this._databaseName }
            });
        return result;
    }

    /**
     * Handle the result of the query
     *
     * @param result - Is the result of the query to handle
     * @param noResultKey - Is the key of the message to throw if the result is empty
     * @param canThrow - If the _handleResult can throw an error to the caller (default is true)
     *
     * @throws ({@link AndesiteError}) - If the query can throw an error and an error occurred ({@link noResultKey})
     *
     * @returns The data returned from the query or void if an error occurred ({@link T})
     */
    protected _handleResult(
        result: Partial<T>,
        noResultKey: string,
        canThrow: boolean = true
    ): Partial<T> | void {
        if (!result && canThrow)
            throw new AndesiteError({
                messageKey: noResultKey,
                detail: { table: this._table, database: this._databaseName }
            });
        return result;
    }
}

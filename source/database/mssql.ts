import { EventEmitter } from 'events';
import knex, { type Knex } from 'knex';

import { CoreError } from '#/error/coreError';
import { Repository } from '#/repository/repository';
import { databaseKeyError } from './enums/databaseKeyError';
import { mssqlEvent } from './events/mssqlEvent';
import { tableEvent } from './events/tableEvent';
import { Table } from './table';
import type { MSSQLDatabaseOptions } from './types/mssqlDatabaseOption';
import type { MssqlEventLog } from './types/mssqlEventLog';

/**
 * Manages the connection with an MSSQL database.
 * The class extends {@link EventEmitter}.
 *
 * - Emits events for logging and table operations.
 * - Automatically generates repositories and tables for CRUD operations.
 * - Allows custom repository implementations per table.
 *
 * Example usage:
 * ```typescript
 * const mssql = new MSSQL(options);
 * await mssql.connect();
 * const users = await mssql.getRepository('users').find();
 * ```
 */
export class MSSQL extends EventEmitter {
    /**
     * Indicates whether the database is connected.
     */
    private _isConnected = false;

    /**
     * The name of the database.
     */
    private readonly _databaseName: string;

    /**
     * A map of tables in the database.
     * @see {@link Table}
     */
    private readonly _tables = new Map<string, Table>();

    /**
     * A map of repositories for each table.
     * @see {@link Repository}
     */
    private readonly _repositories = new Map<string, Repository>();

    /**
     * The Knex instance for the database connection.
     * @see {@link Knex}
     * @see https://knexjs.org/
     */
    private readonly _db: Knex;

    /**
     * Indicates whether to add basic event listeners for all tables.
     * @default false
     */
    private readonly _pulse: boolean;

    /**
     * Create a new instance of `MSSQL` with the specified options.
     * @param options - The configuration options for the MSSQL database connection.
     * @see {@link MSSQLDatabaseOptions}
     */
    public constructor(options: MSSQLDatabaseOptions) {
        super();
        this._databaseName = options.databaseName;
        this._pulse = options.pulse ?? false;
        this._db = knex({
            client: 'mssql',
            debug: options.debug ?? true,
            acquireConnectionTimeout: options.connectionTimeout ?? 20000,
            log: {
                debug: (debug): void => {
                    if (options.debug) {
                        const tables = this._extractTablesFromSqlQuery(debug.sql as string);
                        const eventDebugLog: MssqlEventLog = {
                            database: options.databaseName,
                            tables,
                            queryUuid: debug.__knexQueryUid,
                            method: debug.method,
                            sql: debug.sql,
                            bindings: debug.bindings
                        };
                        this.emit(mssqlEvent.log, eventDebugLog);
                    }
                }
            },
            connection: {
                database: options.databaseName,
                host: options.host,
                port: options.port,
                user: options.user,
                password: options.password,
                options: {
                    encrypt: options.encrypt ?? true
                },
                bigNumberStrings: false
            },
            pool: {
                min: options.poolMin ?? 2,
                max: options.poolMax ?? 10
            }
        });
    }

    /**
     * Establishes a connection to the MSSQL database.
     *
     * If the connection is successful, introspection is performed to retrieve information about tables, columns(fields), and primary keys.
     * This information is used to create instances of {@link Table} and {@link Repository} for each table in the database.
     *
     * @throws ({@link CoreError}) Thrown if an error occurs during the connection process. ({@link databaseKeyError.mssqlConnectionError})
     */
    public async connect(): Promise<void> {
        try {
            await this._introspectDatabase();
            this._isConnected = true;
            if (this._pulse)
                this._addEventKnex();
        } catch (error) {
            throw new CoreError({
                key: databaseKeyError.mssqlConnectionError,
                message: `Failed to connect to the database: "${this._databaseName}".`,
                cause: error
            });
        }
    }

    /**
     * Closes the connection to the MSSQL database.
     *
     * @throws ({@link CoreError}) Thrown if the database is not connected. ({@link databaseKeyError.mssqlNotConnected})
     * @throws ({@link CoreError}) Thrown if an error occurs during the disconnection process. ({@link databaseKeyError.mssqlDisconnectError})
     */
    public async disconnect(): Promise<void> {
        if (!this._isConnected)
            throw new CoreError({
                key: databaseKeyError.mssqlNotConnected,
                message: `Database "${this._databaseName}" is not connected.`
            });
        try {
            await this._db.destroy();
            this._isConnected = false;
        } catch (error) {
            throw new CoreError({
                key: databaseKeyError.mssqlDisconnectError,
                message: `Failed to disconnect from the database: "${this._databaseName}".`,
                cause: error
            });
        }
    }

    /**
     * Retrieves a repository for a specific table.
     *
     * @param tableName - The name of the table to retrieve the repository for.
     * @param customRepository - Optional custom repository class to use for the table. The class must extend {@link Repository}.
     *
     * @throws ({@link CoreError}) Thrown if the database is not connected. ({@link databaseKeyError.mssqlNotConnected})
     * @throws ({@link CoreError}) Thrown if the specified table is not found. ({@link databaseKeyError.mssqlTableNotFound})
     *
     * @template TModel - The type of the model for the repository.
     * @template TRepo - The repository to retrieve extends {@link Repository}.
     *
     * @returns The {@link Repository} for the specified table.
     */
    public getRepository<TModel, TRepo extends Repository<TModel>>(
        tableName: string,
        customRepository: new (knex: Knex, table: Table) => TRepo
    ): TRepo;
    public getRepository<TModel = unknown>(
        tableName: string
    ): Repository<TModel>;
    public getRepository(
        tableName: string,
        customRepository?: new (knex: Knex, table: Table) => Repository
    ): Repository {
        if (!this._isConnected)
            throw new CoreError({
                key: databaseKeyError.mssqlNotConnected,
                message: `Database "${this._databaseName}" is not connected.`
            });
        if (!this._tables.has(tableName))
            throw new CoreError({
                key: databaseKeyError.mssqlTableNotFound,
                message: `Table not found: "${tableName}".`,
                cause: { table: tableName }
            });

        let repo = this._repositories.get(tableName);

        if (customRepository) {
            const table = this._tables.get(tableName) as Table;
            if (repo && repo instanceof customRepository)
                return repo;
            repo = new customRepository(this._db, table);
            this._repositories.set(tableName, repo);
            return repo;
        }
        return this._repositories.get(tableName) as Repository;
    }

    /**
     * Retrieves a table by name.
     *
     * @param tableName - The name of the table to retrieve.
     *
     * @throws ({@link CoreError}) Thrown if the database is not connected. ({@link databaseKeyError.mssqlNotConnected})
     * @throws ({@link CoreError}) Thrown if the specified table is not found. ({@link databaseKeyError.mssqlTableNotFound})
     *
     * @returns The {@link Table} object for the specified table.
    */
    public getTable(tableName: string): Table {
        if (!this._isConnected)
            throw new CoreError({
                key: databaseKeyError.mssqlNotConnected,
                message: `Database "${this._databaseName}" is not connected.`
            });
        if (!this._tables.has(tableName))
            throw new CoreError({
                key: databaseKeyError.mssqlTableNotFound,
                message: `Table not found: "${tableName}".`,
                cause: { table: tableName }
            });
        return this._tables.get(tableName) as Table;
    }

    /**
     * Retrieves the name of the database.
     *
     * @returns The name of the database.
     */
    public get databaseName(): string {
        return this._databaseName;
    }

    /**
     * Retrieves the map of tables in the database.
     *
     * @returns A map of table names to {@link Table} instances.
     */
    public get tables(): Map<string, Table> {
        return this._tables;
    }

    /**
     * Retrieves the map of repositories for each table.
     *
     * @returns A map of table names to {@link Repository} instances.
     */
    public get repositories(): Map<string, Repository> {
        return this._repositories;
    }

    /**
     * Indicates whether the database is connected.
     *
     * @returns `true` if the database is connected, `false` otherwise.
     */
    public get isConnected(): boolean {
        return this._isConnected;
    }

    /**
     * Retrieves the Knex instance for the database connection.
     *
     * @throws ({@link CoreError}) Thrown if the database is not connected. ({@link databaseKeyError.mssqlNotConnected})
     *
     * @returns The {@link Knex} instance for the database connection.
     */
    public get db(): Knex {
        if (!this._isConnected)
            throw new CoreError({
                key: databaseKeyError.mssqlNotConnected,
                message: `Database "${this._databaseName}" is not connected.`
            });
        return this._db;
    }

    /**
     * Introspects the database to retrieve information about tables, columns(fields), and primary keys.
     * Creates instances of {@link Table} and {@link Repository} for each table in the database.
     */
    private async _introspectDatabase(): Promise<void> {
        interface RawColumns {
            tableName: string,
            fields: string,
            primaryKeyColumn: string,
            primaryKeyType: string
        }

        const result: RawColumns[] = await this._db
            .from({ c: 'information_schema.columns' })
            .select('c.table_name as tableName')
            .select(this._db.raw('STRING_AGG(c.column_name, \',\') AS fields'))
            .select('pk.primaryKeyColumn as primaryKeyColumn')
            .select('pk.primaryKeyType as primaryKeyType')
            .leftJoin(
                this._db
                    .from({ tc: 'information_schema.table_constraints' })
                    .join({ kcu: 'information_schema.key_column_usage' }, 'tc.constraint_name', 'kcu.constraint_name')
                    .join(
                        { col: 'information_schema.columns' },
                        (builder) => {
                            builder.on('col.table_name', '=', 'kcu.table_name')
                                .andOn('col.column_name', '=', 'kcu.column_name');
                        }
                    )
                    .where('tc.constraint_type', 'PRIMARY KEY')
                    .groupBy('tc.table_name', 'kcu.column_name', 'col.data_type')
                    .select('tc.table_name as tableName')
                    .select('kcu.column_name as primaryKeyColumn')
                    .select('col.data_type as primaryKeyType')
                    .as('pk'),
                'c.table_name',
                'pk.tableName'
            )
            .groupBy('c.table_name', 'pk.primaryKeyColumn', 'pk.primaryKeyType');

        const fieldsByTable = result.reduce((acc, { tableName, fields, primaryKeyColumn, primaryKeyType }) => {
            const primaryKeyTypeTs = primaryKeyType === 'int' ? 'NUMBER' : 'STRING';
            acc.set(tableName, {
                fields: fields.split(','),
                primaryKey: [primaryKeyColumn, primaryKeyTypeTs]
            });
            return acc;
        }, new Map<string, { fields: string[], primaryKey: [string, 'NUMBER' | 'STRING'] }>());

        fieldsByTable.forEach((desc, tableName) => {
            const table = new Table(this._databaseName, tableName, desc.fields, desc.primaryKey);
            this._tables.set(tableName, table);
            this._repositories.set(tableName, new Repository(this._db, table));
        });
    }

    /**
     * Extracts table names from a SQL query.
     *
     * @param sql - The SQL query string to extract table names from.
     *
     * @returns An array of table names found in the SQL query.
     */
    private _extractTablesFromSqlQuery(sql: string): string[] {
        const tableRegex = /(?:update|insert\s+into|delete\s+from|from|join|with)\s+\[?([^\]\s]+)\]?/gi;
        const matches = [...sql.matchAll(tableRegex)].map((match) => match[1]);
        return Array.from(new Set(matches));
    }

    /**
     * Handles the response from a query and emits the appropriate event based on the method.
     *
     * @param response - The response from the query.
     * @param obj - The query object containing the method and SQL query string.
     */
    private _handleQueryResponse(response: unknown, obj: Record<string, unknown>): void {
        const tables = this._extractTablesFromSqlQuery(obj.sql as string);
        const table = this._tables.get(tables[0]);
        switch (obj.method) {
            case 'select':
                table?.emit(tableEvent.selected, response);
                break;
            case 'insert':
                table?.emit(tableEvent.created, response);
                break;
            case 'update':
                table?.emit(tableEvent.updated, response);
                break;
            case 'delete':
                table?.emit(tableEvent.deleted, response);
                break;
            default:
                break;
        }
    }

    /**
     * Handles an error from a query and emits the `query:error` event.
     *
     * @param error - The error that occurred during the query.
     * @param query - The query object containing the method and SQL query string.
     */
    private _handleQueryError(error: Error, query: Record<string, unknown>): void {
        this.emit('query:error', error, query);
    }

    /**
     * Adds event listeners to the Knex instance to handle query responses and errors.
     */
    private _addEventKnex(): void {
        this._db.on('query-error', this._handleQueryError.bind(this));
        this._db.on('query-response', this._handleQueryResponse.bind(this));
    }
}

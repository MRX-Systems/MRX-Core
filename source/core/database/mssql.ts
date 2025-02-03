import { EventEmitter } from 'events';
import knex, { type Knex } from 'knex';

import { Repository } from '#/core/repository/repository';
import { CoreError } from '#/error';
import { DATABASE_KEY_ERROR } from '#/error/key/databaseKeyError';
import { EVENT_MSSQL } from '#/types/constant/eventMssql';
import { EVENT_TABLE } from '#/types/constant/eventTable';
import type { MssqlEventLog } from '#/types/data/mssqlEventLog';
import { Table } from './table';

/**
 * Options to configure the MSSQL database connection.
 */
export interface MSSQLDatabaseOptions {
    /**
     * The name of the database to connect to.
     */
    databaseName: string;

    /**
     * The host of the database server.
     */
    host: string;

    /**
     * The port number for the database connection.
     */
    port: number;

    /**
     * The username for authenticating with the database.
     */
    user: string;

    /**
     * The password for authenticating with the database.
     */
    password: string;

    /**
     * Whether to encrypt the database connection.
     * @defaultValue true
     */
    encrypt?: boolean;

    /**
     * Minimum number of connections in the connection pool.
     * @defaultValue 2
     */
    poolMin?: number;

    /**
     * Maximum number of connections in the connection pool.
     * @defaultValue 10
     */
    poolMax?: number;

    /**
     * The timeout in milliseconds for acquiring a connection.
     * @defaultValue 20000
     */
    connectionTimeout?: number;

    /**
     * Enables debug mode for logging database operations.
     * @defaultValue false
     */
    debug?: boolean;

    /**
     * If set to true, adds basic event listeners for all tables.
     * @defaultValue false
     * @example
     * ```typescript
     * const mssql = new MSSQL(options);
     * await mssql.connect();
     * // SELECTED, CREATED, UPDATED, DELETED
     * mssql.table('table_name').on(EVENT_TABLE.SELECTED, (data: unknown) => {
     *    console.log(data); // data is the response from the query
     * });
     * ```
     */
    pulse?: boolean;
}

/**
 * The `MSSQL` class manages the connection and operations with an **MSSQL** database.
 * It supports event emission by extending the {@link EventEmitter} class.
 *
 * When an instance of `MSSQL` is created, it can be configured using {@link MSSQLDatabaseOptions}.
 * The connection to the database is established using the {@link MSSQL.connect} method, which performs introspection
 * to retrieve information about tables, columns(fields), and primary keys.
 *
 * Once the connection is established, objects of type {@link Table} and {@link AbstractRepository} are automatically
 * generated for each table, allowing for seamless database operations. You can also provide a custom repository implementation
 * for specific tables using {@link MSSQL.setCustomRepository}.
 *
 * ### Key Features:
 * - Manage connections to MSSQL databases.
 * - Support for event logging via {@link EventEmitter}.
 * - Automatic generation of repositories and tables for CRUD operations.
 * - Customization of repositories for specific use cases.
 * - Integration of table-specific events to track operations (e.g., `SELECTED`, `CREATED`, `UPDATED`, `DELETED`).
 *
 * ### Overview:
 * @example
 * ```typescript
 * const options: MSSQLDatabaseOptions = {
 *     databaseName: 'exampleDb',
 *     host: 'localhost',
 *     port: 1433,
 *     user: 'sa',
 *     password: 'password',
 *     debug: true
 * };
 *
 * const mssql = new MSSQL(options);
 *
 * // Listen to log events
 * mssql.on(EVENT_MSSQL.LOG, (log: MssqlEventLog) => {
 *     console.log('Log:', log);
 * });
 *
 * await mssql.connect(); // Connect to the database
 *
 * // Access a table and listen to its events
 * const table = mssql.table('users');
 * table.on(EVENT_TABLE.SELECTED, (response) => {
 *     console.log('Selected data:', response);
 * });
 *
 * // Use the default repository for queries
 * const defaultRepository = mssql.getRepository('users');
 * const users = await defaultRepository.find(); // Retrieve all users
 * console.log(users);
 *
 * // Example of a custom repository
 * interface ProductModel {
 *     id: number;
 *     name: string;
 * }
 *
 * class ProductRepository extends AbstractRepository<ProductModel> {
 *     public customQuery(): void {
 *         console.log('Custom query executed');
 *     }
 * }
 *
 * mssql.setCustomRepository('products', ProductRepository); // Associate a custom repository
 * const customRepo = mssql.getRepository<ProductRepository, ProductModel>('products');
 * customRepo.customQuery(); // Execute a custom method
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
     */

    private readonly _tables = new Map<string, Table>();

    /**
     * A map of repositories for each table.
     */
    private readonly _repositories = new Map<string, Repository<unknown>>();

    /**
     * The Knex instance for the database connection. ({@link Knex})
     * @see https://knexjs.org/
     */
    private readonly _db: Knex;

    /**
     * Indicates whether to add basic event listeners for all tables.
     */
    private readonly _pulse: boolean;

    /**
     * Create a new instance of `MSSQL` with the specified options.
     * @param options - The configuration options for the MSSQL database connection. ({@link MSSQLDatabaseOptions})
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
                        this.emit(EVENT_MSSQL.LOG, eventDebugLog);
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
     *
     * @throws ({@link CoreError}) Thrown if an error occurs during the connection process. ({@link DATABASE_KEY_ERROR.MSSQL_CONNECTION_ERROR})
     */
    public async connect(): Promise<void> {
        try {
            await this._introspectDatabase();
            this._isConnected = true;
            if (this._pulse)
                this._addEventKnex();
        } catch (error) {
            throw new CoreError({
                key: DATABASE_KEY_ERROR.MSSQL_CONNECTION_ERROR,
                message: `Failed to connect to the database: "${this._databaseName}".`,
                cause: error
            });
        }
    }

    /**
     * Closes the connection to the MSSQL database.
     *
     * @throws ({@link CoreError}) Thrown if the database is not connected. ({@link DATABASE_KEY_ERROR.MSSQL_NOT_CONNECTED})
     * @throws ({@link CoreError}) Thrown if an error occurs during the disconnection process. ({@link DATABASE_KEY_ERROR.MSSQL_DISCONNECT_ERROR})
     */
    public async disconnect(): Promise<void> {
        if (!this._isConnected)
            throw new CoreError({
                key: DATABASE_KEY_ERROR.MSSQL_NOT_CONNECTED,
                message: `Database "${this._databaseName}" is not connected.`
            });
        try {
            await this._db.destroy();
            this._isConnected = false;
        } catch (error) {
            throw new CoreError({
                key: DATABASE_KEY_ERROR.MSSQL_DISCONNECT_ERROR,
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
     * @throws ({@link CoreError}) Thrown if the database is not connected. ({@link DATABASE_KEY_ERROR.MSSQL_NOT_CONNECTED})
     * @throws ({@link CoreError}) Thrown if the specified table is not found. ({@link DATABASE_KEY_ERROR.MSSQL_TABLE_NOT_FOUND})
     *
     * @typeParam TModel - The type of the model for the repository.
     * @typeParam TRepo - The repository to retrieve extends {@link Repository}.
     *
     * @returns The repository for the specified table.
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
        customRepository?: new (knex: Knex, table: Table) => Repository<unknown>
    ): Repository<unknown> {
        if (!this._isConnected)
            throw new CoreError({
                key: DATABASE_KEY_ERROR.MSSQL_NOT_CONNECTED,
                message: `Database "${this._databaseName}" is not connected.`
            });
        if (!this._tables.has(tableName))
            throw new CoreError({
                key: DATABASE_KEY_ERROR.MSSQL_TABLE_NOT_FOUND,
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
        return this._repositories.get(tableName) as Repository<unknown>;
    }

    /**
     * Retrieves a table by name.
     *
     * @param tableName - The name of the table to retrieve.
     * @returns The table object for the specified table.
     *
     * @throws ({@link CoreError}) Thrown if the database is not connected. ({@link DATABASE_KEY_ERROR.MSSQL_NOT_CONNECTED})
     * @throws ({@link CoreError}) Thrown if the specified table is not found. ({@link DATABASE_KEY_ERROR.MSSQL_TABLE_NOT_FOUND})
     */
    public table(tableName: string): Table {
        if (!this._isConnected)
            throw new CoreError({
                key: DATABASE_KEY_ERROR.MSSQL_NOT_CONNECTED,
                message: `Database "${this._databaseName}" is not connected.`
            });
        if (!this._tables.has(tableName))
            throw new CoreError({
                key: DATABASE_KEY_ERROR.MSSQL_TABLE_NOT_FOUND,
                message: `Table not found: "${tableName}".`,
                cause: { table: tableName }
            });
        return this._tables.get(tableName) as Table;
    }

    /**
     * Gets the name of the database.
     */
    public get databaseName(): string {
        return this._databaseName;
    }

    /**
     * Indicates whether the database is connected.
     */
    public get isConnected(): boolean {
        return this._isConnected;
    }

    /**
     * Gets the Knex instance for the database connection.
     *
     * @throws ({@link CoreError}) Thrown if the database is not connected. ({@link DATABASE_KEY_ERROR.MSSQL_NOT_CONNECTED})
     */
    public get db(): Knex {
        if (!this._isConnected)
            throw new CoreError({
                key: DATABASE_KEY_ERROR.MSSQL_NOT_CONNECTED,
                message: `Database "${this._databaseName}" is not connected.`
            });
        return this._db;
    }

    /**
     * Introspects the database to retrieve information about tables, columns(fields), and primary keys.
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
                table?.emit(EVENT_TABLE.SELECTED, response);
                break;
            case 'insert':
                table?.emit(EVENT_TABLE.CREATED, response);
                break;
            case 'update':
                table?.emit(EVENT_TABLE.UPDATED, response);
                break;
            case 'delete':
                table?.emit(EVENT_TABLE.DELETED, response);
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

import knex, { type Knex } from 'knex';

import { InternalError } from '#/errors/internal-error';
import { Repository } from '#/modules/repository/repository';
import { TypedEventEmitter } from '#/modules/typed-event-emitter/typed-event-emitter';
import { DATABASE_ERROR_KEYS } from './enums/database-error-keys';
import type { MssqlEventMap } from './events/mssql-event-map';
import { Table } from './table';
import type { MSSQLDatabaseOptions } from './types/mssql-database-option';
import type { QueryContext } from './types/query-context';

/**
 * Manages the connection with an MSSQL database.
 * The class extends {@link TypedEventEmitter}<{@link MssqlEventMap}>.
 *
 * - Emits events.
 * - Automatically generates repositories and tables for CRUD operations.
 * - Allows custom repository implementations per table.
 *
 * @example
 * ```ts
 * const mssql = new MSSQL(options);
 * await mssql.connect();
 * const users = await mssql.getRepository('users').find();
 * ```
 */
export class MSSQL extends TypedEventEmitter<MssqlEventMap> {
	/**
	 * Indicates whether the database is connected.
	 */
	private _isConnected = false;

	/**
	 * The name of the database.
	 */
	public readonly databaseName: string;

	/**
	 * A map of repositories for each table.
	 */
	public readonly repositories = new Map<string, Repository>();

	/**
	 * The Knex instance for the database connection.
	 */
	private readonly _db: Knex;

	/**
	 * Indicates whether to add basic event listeners for all tables.
	 * @defaultValue false
	 */
	private readonly _isEventEnabled: boolean;

	/**
	 * Create a new instance of `MSSQL` with the specified options.
	 *
	 * @param options - The configuration options for the MSSQL database connection.
	 */
	public constructor(options: MSSQLDatabaseOptions) {
		super();
		this.databaseName = options.databaseName;
		this._isEventEnabled = options.isEventEnabled ?? false;
		this._db = knex({
			client: 'mssql',
			acquireConnectionTimeout: options.connectionTimeout ?? 20000,
			compileSqlOnError: true,
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
	 * @throws ({@link InternalError}) Thrown if an error occurs during the connection process.
	 */
	public async connect(): Promise<void> {
		try {
			await this._introspectDatabase();
			this._isConnected = true;
			if (this._isEventEnabled)
				this._addEventKnex();
		} catch (error) {
			throw new InternalError(DATABASE_ERROR_KEYS.MSSQL_CONNECTION_ERROR, {
				databaseName: this.databaseName,
				error
			});
		}
	}

	/**
	 * Closes the connection to the MSSQL database.
	 *
	 * @throws ({@link InternalError}) Thrown if the database is not connected.
	 * @throws ({@link InternalError}) Thrown if an error occurs during the disconnection process.
	 */
	public async disconnect(): Promise<void> {
		if (!this._isConnected)
			throw new InternalError(DATABASE_ERROR_KEYS.MSSQL_NOT_CONNECTED, {
				databaseName: this.databaseName
			});
		try {
			await this._db.destroy();
			this._isConnected = false;
		} catch (error) {
			throw new InternalError(DATABASE_ERROR_KEYS.MSSQL_DISCONNECT_ERROR, {
				databaseName: this.databaseName,
				error
			});
		}
	}

	/**
	 * Retrieves a repository for a specific table.
	 *
	 * @template TModel - The type of the model for the repository.
	 * @template TRepo - The repository to retrieve.
	 *
	 * @param tableName - The name of the table to retrieve the repository for.
	 * @param customRepository - Optional custom repository class to use for the table.
	 *
	 * @throws ({@link InternalError}) Thrown if the database is not connected.
	 * @throws ({@link InternalError}) Thrown if the specified table is not found.
	 *
	 * @returns The {@link Repository} for the specified table.
	 */
	public getRepository<TModel, TRepo extends Repository<TModel>>(
		tableName: string,
		customRepository: new (knex: Knex, table: Table) => TRepo
	): TRepo;
	public getRepository<TModel = Record<string, unknown>>(
		tableName: string
	): Repository<TModel>;
	public getRepository(
		tableName: string,
		customRepository?: new (knex: Knex, table: Table) => Repository
	): Repository {
		if (!this._isConnected)
			throw new InternalError(DATABASE_ERROR_KEYS.MSSQL_NOT_CONNECTED, { databaseName: this.databaseName });
		if (!this.repositories.has(tableName))
			throw new InternalError(DATABASE_ERROR_KEYS.MSSQL_TABLE_NOT_FOUND, { table: tableName });

		const repo = this.repositories.get(tableName) as Repository;

		if (customRepository) {
			if (repo instanceof customRepository)
				return repo;
			const { table } = repo;
			const customRepo = new customRepository(this._db, table);
			this.repositories.set(tableName, customRepo);
			return customRepo;
		}
		return repo;
	}

	/**
	 * Retrieves a table by name.
	 *
	 * @param tableName - The name of the table to retrieve.
	 *
	 * @throws ({@link InternalError}) Thrown if the database is not connected.
	 * @throws ({@link InternalError}) Thrown if the specified table is not found.
	 *
	 * @returns The {@link Table} object for the specified table.
	 */
	public getTable(tableName: string): Table {
		if (!this._isConnected)
			throw new InternalError(DATABASE_ERROR_KEYS.MSSQL_NOT_CONNECTED, { databaseName: this.databaseName });
		const repo = this.repositories.get(tableName);
		if (!repo)
			throw new InternalError(DATABASE_ERROR_KEYS.MSSQL_TABLE_NOT_FOUND, { table: tableName });
		return repo.table;
	}

	/**
	 * Retrieves the map of tables in the database.
	 *
	 * @returns A map of table names to {@link Table} instances.
	 */
	public get tables(): Map<string, Table> {
		return new Map([...this.repositories].map(([name, repo]) => [name, repo.table]));
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
	 * @throws ({@link InternalError}) Thrown if the database is not connected.
	 *
	 * @returns The {@link Knex} instance for the database connection.
	 */
	public get db(): Knex {
		if (!this._isConnected)
			throw new InternalError(DATABASE_ERROR_KEYS.MSSQL_NOT_CONNECTED, { databaseName: this.databaseName });
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

		for (const { tableName, fields, primaryKeyColumn, primaryKeyType } of result) {
			const primaryKeyTypeTs: 'NUMBER' | 'STRING' = primaryKeyType === 'int' || primaryKeyType === 'bigint' ? 'NUMBER' : 'STRING';
			const table = new Table(this.databaseName, tableName, fields.split(','), [primaryKeyColumn, primaryKeyTypeTs]);
			this.repositories.set(tableName, new Repository(this._db, table));
		}
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
	 * @param queryContext - The query object containing the method and SQL query string.
	 */
	private _handleQueryResponse(response: unknown[], queryContext: QueryContext): void {
		const tables = this._extractTablesFromSqlQuery(queryContext.sql);
		const table = this.repositories.get(tables[0])?.table;
		switch (queryContext.method) {
			case 'select':
				table?.emit('selected', response, queryContext);
				break;
			case 'insert':
				table?.emit('inserted', response, queryContext);
				break;
			case 'update':
				table?.emit('updated', response, queryContext);
				break;
			case 'del':
				table?.emit('deleted', response, queryContext);
				break;
			default:
				break;
		}
	}

	/**
	 * Adds event listeners to the Knex instance to handle query responses and errors.
	 */
	private _addEventKnex(): void {
		this._db.on('query', (queryContext: QueryContext) => {
			this.emit('query', queryContext);
		});
		this._db.on('query-error', (error: Error, queryContext: QueryContext) => {
			this.emit('query:error', error, queryContext);
		});
		this._db.on('query-response', (response: unknown[], queryContext: QueryContext) => {
			this.emit('query:response', response, queryContext);
			this._handleQueryResponse(response, queryContext);
		});
	}
}

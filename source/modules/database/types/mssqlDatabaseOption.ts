/**
 * Options to configure the MSSQL database connection.
 */
export interface MSSQLDatabaseOptions {
    /** The name of the database to connect to. */
    databaseName: string;
    /** The host of the database server. */
    host: string;
    /** The port number for the database connection. */
    port: number;
    /** The username for authenticating with the database. */
    user: string;
    /** The password for authenticating with the database. */
    password: string;
    /**
     * Whether to encrypt the database connection.
     * When enabled, communication between the client and server will be encrypted,
     *
     * @defaultValue true
     */
    encrypt?: boolean;
    /**
     * Minimum number of connections in the connection pool.
     * This represents the minimum number of connections that will be maintained in the pool,
     * even when there is no activity. Higher values can reduce connection latency
     * but increase resource usage.
     *
     * @defaultValue 2
     */
    poolMin?: number;
    /**
     * Maximum number of connections in the connection pool.
     * This limits how many concurrent connections can be established to the database.
     * Setting this too low might cause connection timeouts during high load,
     * while setting it too high might overload the database server.
     *
     * @defaultValue 10
     */
    poolMax?: number;
    /**
     * The timeout in milliseconds for acquiring a connection.
     * If a connection cannot be acquired within this timeframe, an error will be thrown.
     *
     * @defaultValue 20000
     */
    connectionTimeout?: number;
    /**
     * If set to true, emits events for database operations.
     * (select, create, update, delete) for all tables.
     *
     * @defaultValue false
     * @example
     * ```ts
     * const mssql = new MSSQL(options);
     * await mssql.connect();
     * // selected, inserted, updated, deleted
     * mssql.table('table_name').on('selected', (data: unknown) => {
     *   console.log(data); // data is the response from the query
     * });
     * ```
     */
    isEventEnabled?: boolean;
}
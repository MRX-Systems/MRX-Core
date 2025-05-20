/**
 * Options to configure the MSSQL database connection.
 *
 * @example
 * ```typescript
 * const options: MSSQLDatabaseOptions = {
 *   databaseName: 'my_database',
 *   host: 'localhost',
 *   port: 1433,
 *   user: 'sa',
 *   password: 'Password123',
 *   encrypt: true,
 *   poolMin: 5,
 *   poolMax: 20,
 *   debug: true,
 *   pulse: true
 * };
 * ```
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
     * providing increased security but potentially slight performance impact.
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
     * If set to true, adds basic event listeners for all tables.
     * This automatically sets up event listeners to track database operations
     * (select, create, update, delete) for all tables, allowing for easy monitoring
     * and event-driven programming.
     *
     * [TODO] - Change this section when working on the AND-169 ticket.
     *
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
    isEventEnabled?: boolean;
}
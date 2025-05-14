/**
 * Interface for log events emitted by the `MSSQL` class.
 * Used to capture detailed information about database queries.
 *
 * @example
 * ```typescript
 * const mssql = new MSSQL(options);
 * mssql.on(EVENT_MSSQL.LOG, (log: MssqlEventLog) => {
 *     console.log(log);
 * });
 * ```
 *
 * @remarks
 * This interface is intended for internal logging and debugging of MSSQL queries.
 */
export interface MssqlEventLog {
    /** The name of the database where the query was executed. */
    database: string;
    /** A list of tables affected by the query. */
    tables: string[];
    /** A unique identifier for the executed query. */
    queryUuid: string;
    /** The method used in the query (e.g., `SELECT`, `INSERT`, `UPDATE`, `DELETE`). */
    method: string;
    /** The raw SQL query string. */
    sql: string;
    /** The parameters or bindings used in the query. */
    bindings: unknown[];
}
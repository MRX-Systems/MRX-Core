export interface MssqlEventLog {
    /** The name of the database where the query was executed. */
    readonly database: string;
    /** A list of tables affected by the query. */
    readonly tables: string[];
    /** A unique identifier for the executed query. */
    readonly queryUuid: string;
    /** The method used in the query (e.g., `SELECT`, `INSERT`, `UPDATE`, `DELETE`). */
    readonly method: string;
    /** The raw SQL query string. */
    readonly sql: string;
    /** The parameters or bindings used in the query. */
    readonly bindings: unknown[];
}
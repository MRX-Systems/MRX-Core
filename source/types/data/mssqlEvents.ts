import type { Knex } from 'knex';

import type { MssqlEventLog } from './mssqlEventLog';

/**
 * Interface representing events emitted by MSSQL operations.
 *
 * This interface defines the structure of events triggered during database operations
 * with Microsoft SQL Server. Events may include:
 * - Connection events (connect, disconnect, timeout)
 * - Transaction events (begin, commit, rollback)
 * - Query events (execution start, completion, error)
 * - Statement events (prepare, unprepare, execute)
 *
 * Each event contains metadata about the operation, such as:
 * - Timestamp of the event
 * - Connection information
 * - Query details (for query-related events)
 * - Error information (for error events)
 *
 * These events can be used for logging, monitoring, and debugging MSSQL operations.
 */
export interface MSSQLEvents {
    /**
     * Event emitted when a log is generated. {@link MssqlEventLog}
     */
    log: MssqlEventLog;
    /**
     * Event emitted when an error occurs.
     */
    error: {
        /**
         * The error object. {@link Error}
         */
        error: Error;
        /**
         * The query that caused the error. {@link Knex.QueryBuilder}
         */
        query: Knex.QueryBuilder;
    };
}
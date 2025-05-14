/**
 * Database error key is a list of errors in the database context.
 * Each property represents a specific MSSQL error scenario.
 */
export const databaseKeyError = {
    /** Error when failing to connect to MSSQL database. */
    mssqlConnectionError: 'core.error.mssql.database.connection_error',
    /** Error when disconnecting from MSSQL database. */
    mssqlDisconnectError: 'core.error.mssql.database.disconnect_error',
    /** Error when MSSQL database is not connected. */
    mssqlNotConnected: 'core.error.mssql.database.not_connected',
    /** Error when no result is returned from MSSQL query. */
    mssqlNoResult: 'core.error.mssql.database.no_result',
    /** Error when a query fails in MSSQL database. */
    mssqlQueryError: 'core.error.mssql.database.query_error',
    /** Error when access to MSSQL database is denied. */
    mssqlDatabaseAccessDenied: 'core.error.mssql.database.access_denied',
    /** Error when MSSQL database authorization fails. */
    mssqlDatabaseAuthorizationFailed: 'core.error.mssql.database.authorization_failed',
    /** Error when there is a syntax error in MSSQL database. */
    mssqlDatabaseSyntaxError: 'core.error.mssql.database.syntax_error',
    /** Error when a column is not found in MSSQL database. */
    mssqlDatabaseColumnNotFound: 'core.error.mssql.database.column_not_found',
    /** Error when a table is not found in MSSQL database. */
    mssqlTableNotFound: 'core.error.mssql.database.table_not_found',
    /** Error when there is an ambiguous column in MSSQL database. */
    mssqlDatabaseAmbiguousColumn: 'core.error.mssql.database.ambiguous_column',
    /** Error when there is a duplicate key in MSSQL database. */
    mssqlDatabaseDuplicateKey: 'core.error.mssql.database.duplicate_key',
    /** Error when there is a foreign key violation in MSSQL database. */
    mssqlDatabaseForeignKeyViolation: 'core.error.mssql.database.foreign_key_violation',
    /** Error when a unique constraint is violated in MSSQL database. */
    mssqlDatabaseUniqueConstraintViolation: 'core.error.mssql.database.unique_constraint_violation',
    /** Error when a deadlock is detected in MSSQL database. */
    mssqlDatabaseDeadlockDetected: 'core.error.mssql.database.deadlock_detected',
    /** Error when a resource is locked in MSSQL database. */
    mssqlDatabaseResourceLocked: 'core.error.mssql.database.resource_locked',
    /** Error when a transaction is aborted in MSSQL database. */
    mssqlDatabaseTransactionAborted: 'core.error.mssql.database.transaction_aborted',
    /** Error when there is insufficient memory in MSSQL database. */
    mssqlDatabaseInsufficientMemory: 'core.error.mssql.database.insufficient_memory',
    /** Error when there is insufficient storage in MSSQL database. */
    mssqlDatabaseInsufficientStorage: 'core.error.mssql.database.insufficient_storage',
    /** Error when a query times out in MSSQL database. */
    mssqlDatabaseQueryTimeout: 'core.error.mssql.database.query_timeout',
    /** Error when the transaction log is full in MSSQL database. */
    mssqlDatabaseTransactionLogFull: 'core.error.mssql.database.transaction_log_full',
    /** Error when data is too large for MSSQL database. */
    mssqlDatabaseDataTooLarge: 'core.error.mssql.database.data_too_large',
    /** Error when permission is denied in MSSQL database. */
    mssqlDatabasePermissionDenied: 'core.error.mssql.database.permission_denied',
    /** Error when identity insert is not allowed in MSSQL database. */
    mssqlDatabaseIdentityInsertNotAllowed: 'core.error.mssql.database.identity_insert_not_allowed',
    /** Error when updating identity column is not allowed in MSSQL database. */
    mssqlDatabaseCannotUpdateIdentityColumn: 'core.error.mssql.database.cannot_update_identity_column'
} as const;

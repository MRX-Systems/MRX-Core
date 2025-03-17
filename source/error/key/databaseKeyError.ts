/**
 * Database error key is a list of errors in the database context.
 */
export const DATABASE_KEY_ERROR = {
    MSSQL_CONNECTION_ERROR: 'core.error.database.mssql.connection_error',
    MSSQL_DISCONNECT_ERROR: 'core.error.database.mssql.disconnect_error',
    MSSQL_NOT_CONNECTED: 'core.error.database.mssql.not_connected',
    MSSQL_NO_RESULT: 'core.error.database.mssql.no_result',
    MSSQL_QUERY_ERROR: 'core.error.database.mssql.query_error',
    MSSQL_DATABASE_ACCESS_DENIED: 'core.error.database.mssql.database_access_denied',
    MSSQL_DATABASE_AUTHORIZATION_FAILED: 'core.error.database.mssql.database_authorization_failed',
    MSSQL_DATABASE_SYNTAX_ERROR: 'core.error.database.mssql.database_syntax_error',
    MSSQL_DATABASE_COLUMN_NOT_FOUND: 'core.error.database.mssql.database_column_not_found',
    MSSQL_TABLE_NOT_FOUND: 'core.error.database.mssql.table_not_found',
    MSSQL_DATABASE_AMBIGUOUS_COLUMN: 'core.error.database.mssql.database_ambiguous_column',
    MSSQL_DATABASE_DUPLICATE_KEY: 'core.error.database.mssql.database_duplicate_key',
    MSSQL_DATABASE_FOREIGN_KEY_VIOLATION: 'core.error.database.mssql.database_foreign_key_violation',
    MSSQL_DATABASE_UNIQUE_CONSTRAINT_VIOLATION: 'core.error.database.mssql.database_unique_constraint_violation',
    MSSQL_DATABASE_DEADLOCK_DETECTED: 'core.error.database.mssql.database_deadlock_detected',
    MSSQL_DATABASE_RESOURCE_LOCKED: 'core.error.database.mssql.database_resource_locked',
    MSSQL_DATABASE_TRANSACTION_ABORTED: 'core.error.database.mssql.database_transaction_aborted',
    MSSQL_DATABASE_INSUFFICIENT_MEMORY: 'core.error.database.mssql.database_insufficient_memory',
    MSSQL_DATABASE_INSUFFICIENT_STORAGE: 'core.error.database.mssql.database_insufficient_storage',
    MSSQL_DATABASE_QUERY_TIMEOUT: 'core.error.database.mssql.database_query_timeout',
    MSSQL_DATABASE_TRANSACTION_LOG_FULL: 'core.error.database.mssql.database_transaction_log_full',
    MSSQL_DATABASE_DATA_TOO_LARGE: 'core.error.database.mssql.database_data_too_large',
    MSSQL_DATABASE_PERMISSION_DENIED: 'core.error.database.mssql.database_permission_denied',
    MSSQL_DATABASE_IDENTITY_INSERT_NOT_ALLOWED: 'core.error.database.mssql.database_identity_insert_not_allowed',
    MSSQL_DATABASE_CANNOT_UPDATE_IDENTITY_COLUMN: 'core.error.database.mssql.database_cannot_update_identity_column'
} as const;
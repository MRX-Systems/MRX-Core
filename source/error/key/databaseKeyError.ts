/**
 * Database error key is a list of errors in the database context.
 */
export const DATABASE_KEY_ERROR = {
    MSSQL_CONNECTION_ERROR: ['error.core.database.mssql.connection_error', 500],
    MSSQL_DISCONNECT_ERROR: ['error.core.database.mssql.disconnect_error', 500],
    MSSQL_NOT_CONNECTED: ['error.core.database.mssql.not_connected', 500],

    MSSQL_NO_RESULT: ['error.core.database.mssql.no_result', 404],
    MSSQL_QUERY_ERROR: ['error.core.database.mssql.query_error', 500],
    MSSQL_DATABASE_ACCESS_DENIED: ['error.core.database.mssql.database_access_denied', 403],
    MSSQL_DATABASE_AUTHORIZATION_FAILED: ['error.core.database.mssql.database_authorization_failed', 403],
    MSSQL_DATABASE_SYNTAX_ERROR: ['error.core.database.mssql.database_syntax_error', 400],
    MSSQL_DATABASE_COLUMN_NOT_FOUND: ['error.core.database.mssql.database_column_not_found', 400],
    MSSQL_TABLE_NOT_FOUND: ['error.core.database.mssql.table_not_found', 404],
    MSSQL_DATABASE_AMBIGUOUS_COLUMN: ['error.core.database.mssql.database_ambiguous_column', 400],
    MSSQL_DATABASE_DUPLICATE_KEY: ['error.core.database.mssql.database_duplicate_key', 409],
    MSSQL_DATABASE_FOREIGN_KEY_VIOLATION: ['error.core.database.mssql.database_foreign_key_violation', 409],
    MSSQL_DATABASE_UNIQUE_CONSTRAINT_VIOLATION: ['error.core.database.mssql.database_unique_constraint_violation', 409],
    MSSQL_DATABASE_DEADLOCK_DETECTED: ['error.core.database.mssql.database_deadlock_detected', 409],
    MSSQL_DATABASE_RESOURCE_LOCKED: ['error.core.database.mssql.database_resource_locked', 409],
    MSSQL_DATABASE_TRANSACTION_ABORTED: ['error.core.database.mssql.database_transaction_aborted', 409],
    MSSQL_DATABASE_INSUFFICIENT_MEMORY: ['error.core.database.mssql.database_insufficient_memory', 500],
    MSSQL_DATABASE_INSUFFICIENT_STORAGE: ['error.core.database.mssql.database_insufficient_storage', 500],
    MSSQL_DATABASE_QUERY_TIMEOUT: ['error.core.database.mssql.database_query_timeout', 408],
    MSSQL_DATABASE_TRANSACTION_LOG_FULL: ['error.core.database.mssql.database_transaction_log_full', 500],
    MSSQL_DATABASE_DATA_TOO_LARGE: ['error.core.database.mssql.database_data_too_large', 413],
    MSSQL_DATABASE_PERMISSION_DENIED: ['error.core.database.mssql.database_permission_denied', 403],
    MSSQL_DATABASE_IDENTITY_INSERT_NOT_ALLOWED: ['error.core.database.mssql.database_identity_insert_not_allowed', 400],
    MSSQL_DATABASE_CANNOT_UPDATE_IDENTITY_COLUMN: ['error.core.database.mssql.database_cannot_update_identity_column', 400]
} as const;
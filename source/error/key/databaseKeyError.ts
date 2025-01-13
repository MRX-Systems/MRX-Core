/**
 * Database error key is a list of errors in the database context.
 */
export const DATABASE_KEY_ERROR = {
    MSSQL_CONNECTION_ERROR: ['error.core.database.mssql.connection_error', 500],
    MSSQL_DISCONNECT_ERROR: ['error.core.database.mssql.disconnect_error', 500],
    MSSQL_NOT_CONNECTED: ['error.core.database.mssql.not_connected', 500],
    MSSQL_TABLE_NOT_FOUND: ['error.core.database.mssql.table_not_found', 500]
} as const;
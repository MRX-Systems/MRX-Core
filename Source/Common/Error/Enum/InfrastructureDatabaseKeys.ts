/**
 * Enum for Infrastructure Database
 */
export enum InfrastructureDatabaseKeys {
    DATABASE_NOT_CONNECTED = 'error.infrastructure.database.database_not_connected',
    DATABASE_ALREADY_REGISTERED = 'error.infrastructure.database.database_already_registered',
    DATABASE_ALREADY_NOT_REGISTERED = 'error.infrastructure.database.database_already_not_registered',
    DATABASE_NOT_REGISTERED = 'error.infrastructure.database.database_not_registered',

    DATABASE_QUERY_ERROR = 'error.infrastructure.database.query_error',
    DATABASE_MODEL_NOT_CREATED = 'error.infrastructure.database.model_not_created',
    DATABASE_MODEL_NOT_FOUND = 'error.infrastructure.database.model_not_found',
    DATABASE_MODEL_NOT_UPDATED = 'error.infrastructure.database.model_not_updated',
    DATABASE_MODEL_NOT_DELETED = 'error.infrastructure.database.model_not_deleted',
}

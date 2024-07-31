/**
 * InfrastructureErrorKeys is an enum that contains the error codes for the infrastructure layer.
 */
export enum InfrastructureErrorKeys {
    DATABASE_NOT_CONNECTED = 'error.infrastructure.database.database_not_connected',
    DATABASE_ALREADY_REGISTERED = 'error.infrastructure.database.database_already_registered',
    DATABASE_NOT_REGISTERED = 'error.infrastructure.database.database_not_registered',
    DATABASE_INVALID_TYPE = 'error.infrastructure.database.database_invalid_type',

    DATABASE_QUERY_ERROR = 'error.infrastructure.database.query_error',
    DATABASE_MODEL_NOT_CREATED = 'error.infrastructure.database.model_not_created',
    DATABASE_MODEL_NOT_FOUND = 'error.infrastructure.database.model_not_found',
    DATABASE_MODEL_NOT_UPDATED = 'error.infrastructure.database.model_not_updated',
    DATABASE_MODEL_NOT_DELETED = 'error.infrastructure.database.model_not_deleted',

    STORE_NOT_CONNECTED = 'error.infrastructure.store.store_not_connected',

    STORE_ALREADY_REGISTERED = 'error.infrastructure.store.store_already_registered',
    STORE_NOT_REGISTERED = 'error.infrastructure.store.store_already_not_registered',
    STORE_INVALID_TYPE = 'error.infrastructure.store.store_invalid_type',

}

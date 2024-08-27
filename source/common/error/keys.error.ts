/**
 * Error keys for the Core.
 */
export enum ErrorKeys {
    I18N_NOT_INITIALIZED = 'error.core-api.i18n_not_initialized',
    I18N_ALREADY_INITIALIZED = 'error.core-api.i18n_already_initialized',
    INVALID_ENVIRONMENT = 'error.core-api.invalid_environment',

    DATABASE_NOT_CONNECTED = 'error.core-api.database_not_connected',
    DATABASE_ALREADY_REGISTERED = 'error.core-api.database_already_registered',
    DATABASE_INVALID_TYPE = 'error.core-api.database_invalid_type',
    DATABASE_NOT_REGISTERED = 'error.core-api.database_not_registered',

    DATABASE_MODEL_NOT_CREATED = 'error.core-api.database_model_not_created',
    DATABASE_MODEL_NOT_FOUND = 'error.core-api.database_model_not_found',
    DATABASE_MODEL_NOT_UPDATED = 'error.core-api.database_model_not_updated',
    DATABASE_MODEL_NOT_DELETED = 'error.core-api.database_model_not_deleted',
    DATABASE_QUERY_ERROR = 'error.core-api.database_query_error',

    STORE_NOT_CONNECTED = 'error.core-api.store_not_connected',
    STORE_ALREADY_REGISTERED = 'error.core-api.store_already_registered',
    STORE_INVALID_TYPE = 'error.core-api.store_invalid_type',
    STORE_NOT_REGISTERED = 'error.core-api.store_not_registered',
    INTERNAL_SERVER_ERROR = 'error.core-api.internal_server_error',

    DATABASE_NOT_SPECIFIED_IN_HEADER = 'error.core-api.database_not_specified_in_header',

    SET_DATABASE_NAME_OR_DYNAMIC_DATABASE_CONFIG = 'error.core-api.set_database_name_or_dynamic_database_config',
}

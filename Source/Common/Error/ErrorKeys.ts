/**
 * Error keys for the Andesite Core.
 */
export enum ErrorKeys {
    I18N_NOT_INITIALIZED = 'error.andesite-core.i18n_not_initialized',
    I18N_ALREADY_INITIALIZED = 'error.andesite-core.i18n_already_initialized',

    PACKAGE_JSON_EXISTS = 'error.andesite-core.package_json_exists',
    TS_CONFIG_EXISTS = 'error.andesite-core.ts_config_exists',
    ESLINT_EXISTS = 'error.andesite-core.eslint_exists',
    ANDESITE_YML_EXISTS = 'error.andesite-core.andesite_yml_exists',
    ANDESITE_YML_INVALID_CONFIG = 'error.andesite-core.andesite_yml_invalid_config',
    ENTRY_POINT_EXISTS = 'error.andesite-core.entry_point_exists',
    CANCEL_PROMPT = 'error.andesite-core.cancel_prompt',

    DATABASE_NOT_CONNECTED = 'error.andesite-core.database_not_connected',
    DATABASE_ALREADY_REGISTERED = 'error.andesite-core.database_already_registered',
    DATABASE_NOT_REGISTERED = 'error.andesite-core.database_not_registered',
    DATABASE_INVALID_TYPE = 'error.andesite-core.database_invalid_type',

    DATABASE_QUERY_ERROR = 'error.andesite-core.database_query_error',
    DATABASE_MODEL_NOT_CREATED = 'error.andesite-core.database_model_not_created',
    DATABASE_MODEL_NOT_FOUND = 'error.andesite-core.database_model_not_found',
    DATABASE_MODEL_NOT_UPDATED = 'error.andesite-core.database_model_not_updated',
    DATABASE_MODEL_NOT_DELETED = 'error.andesite-core.database_model_not_deleted',

    STORE_NOT_CONNECTED = 'error.andesite-core.store_not_connected',
    STORE_ALREADY_REGISTERED = 'error.andesite-core.store_already_registered',
    STORE_NOT_REGISTERED = 'error.andesite-core.store_not_registered',
    STORE_INVALID_TYPE = 'error.andesite-core.store_invalid_type',

    INTERNAL_SERVER_ERROR = 'error.andesite-core.internal_server_error',
}

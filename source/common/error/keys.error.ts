/**
 * Error keys for the Core.
 */
export const ErrorKeys = {
    I18N_NOT_INITIALIZED: 'error.core-api.i18n_not_initialized',
    I18N_ALREADY_INITIALIZED: 'error.core-api.i18n_already_initialized',
    INVALID_ENVIRONMENT: 'error.core-api.invalid_environment',

    DATABASE_NOT_CONNECTED: 'error.core-api.database_not_connected',
    /**
     * Interpolation :
     * - name : The name of the database
     */
    DATABASE_ALREADY_REGISTERED: 'error.core-api.database_already_registered',
    /**
     * Interpolation :
     * - type : The type of the database
     */
    DATABASE_INVALID_TYPE: 'error.core-api.database_invalid_type',
    /**
     * Interpolation :
     * - name : The name of the database
     */
    DATABASE_NOT_REGISTERED: 'error.core-api.database_not_registered',

    /**
     * Interpolation :
     * - table : The name of the table
     * - database : The name of the database
     * - error : The error message
     */
    DATABASE_MODEL_NOT_CREATED: 'error.core-api.database_model_not_created',
    /**
     * Interpolation :
     * - table : The name of the table
     * - database : The name of the database
     * - error : The error message
     */
    DATABASE_MODEL_NOT_FOUND: 'error.core-api.database_model_not_found',
    /**
     * Interpolation :
     * - table : The name of the table
     * - database : The name of the database
     * - error : The error message
     */
    DATABASE_MODEL_NOT_UPDATED: 'error.core-api.database_model_not_updated',
    /**
     * Interpolation :
     * - table : The name of the table
     * - database : The name of the database
     * - error : The error message
     */
    DATABASE_MODEL_NOT_DELETED: 'error.core-api.database_model_not_deleted',
    /**
     * Interpolation :
     * - table : The name of the table
     * - database : The name of the database
     * - error : The error message
     */
    DATABASE_QUERY_ERROR: 'error.core-api.database_query_error',

    DYNAMIC_DATABASE_CONFIG_NOT_SET: 'error.core-api.dynamic_database_config_not_set',

    STORE_NOT_CONNECTED: 'error.core-api.store_not_connected',
    /**
     * Interpolation :
     * - name : The name of the store
     */
    STORE_ALREADY_REGISTERED: 'error.core-api.store_already_registered',
    /**
     * Interpolation :
     * - type : The type of the store
     */
    STORE_INVALID_TYPE: 'error.core-api.store_invalid_type',
    /**
     * Interpolation :
     * - name : The name of the store
     */
    STORE_NOT_REGISTERED: 'error.core-api.store_not_registered',
    INTERNAL_SERVER_ERROR: 'error.core-api.internal_server_error',

    DATABASE_NOT_SPECIFIED_IN_HEADER: 'error.core-api.database_not_specified_in_header',

    ANDESITE_YML_EXISTS: 'error.core-api.andesite_yml_exists',
    ANDESITE_YML_INVALID_CONFIG: 'error.core-api.andesite_yml_invalid_config',

    ESLINT_EXISTS: 'error.core-api.eslint_exists',

    PACKAGE_JSON_EXISTS: 'error.core-api.package_json_exists',

    TS_CONFIG_EXISTS: 'error.core-api.ts_config_exists',

    ENTRY_POINT_EXISTS: 'error.core-api.entry_point_exists',

    CANCEL_PROMPT: 'error.core-api.cancel_prompt',
}

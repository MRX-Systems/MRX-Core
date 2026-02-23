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
    /**
     * Interpolation :
     * - table : The name of the table
     * - database : The name of the database
     * - error : The error message
     */
    DATABASE_DUPLICATE_KEY: 'error.core-api.database_duplicate_key',
    /**
     * Interpolation :
     * - table : The name of the table
     * - database : The name of the database
     * - error : The error message
     */
    DATABASE_ACCESS_DENIED: 'error.core-api.database_access_denied',
    /**
     * Interpolation :
     * - table : The name of the table
     * - database : The name of the database
     * - error : The error message
     */
    DATABASE_AUTHORIZATION_FAILED: 'error.core-api.database_authorization_failed',
    /**
     * Interpolation :
     * - table : The name of the table
     * - database : The name of the database
     * - error : The error message
     */
    DATABASE_SYNTAX_ERROR: 'error.core-api.database_syntax_error',
    /**
     * Interpolation :
     * - table : The name of the table
     * - database : The name of the database
     * - error : The error message
     */
    DATABASE_COLUMN_NOT_FOUND: 'error.core-api.database_column_not_found',
    /**
     * Interpolation :
     * - table : The name of the table
     * - database : The name of the database
     * - error : The error message
     */
    DATABASE_TABLE_NOT_FOUND: 'error.core-api.database_table_not_found',
    /**
     * Interpolation :
     * - table : The name of the table
     * - database : The name of the database
     * - error : The error message
     */
    DATABASE_AMBIGUOUS_COLUMN: 'error.core-api.database_ambiguous_column',
    /**
     * Interpolation :
     * - table : The name of the table
     * - database : The name of the database
     * - error : The error message
     */
    DATABASE_FOREIGN_KEY_VIOLATION: 'error.core-api.database_foreign_key_violation',
    /**
     * Interpolation :
     * - table : The name of the table
     * - database : The name of the database
     * - error : The error message
     */
    DATABASE_UNIQUE_CONSTRAINT_VIOLATION: 'error.core-api.database_unique_constraint_violation',
    /**
     * Interpolation :
     * - table : The name of the table
     * - database : The name of the database
     * - error : The error message
     */
    DATABASE_DEADLOCK_DETECTED: 'error.core-api.database_deadlock_detected',
    /**
     * Interpolation :
     * - table : The name of the table
     * - database : The name of the database
     * - error : The error message
     */
    DATABASE_RESOURCE_LOCK: 'error.core-api.database_resource_lock',
    /**
     * Interpolation :
     * - table : The name of the table
     * - database : The name of the database
     * - error : The error message
     */
    DATABASE_TRANSACTION_ABORTED: 'error.core-api.database_transaction_aborted',
    /**
     * Interpolation :
     * - table : The name of the table
     * - database : The name of the database
     * - error : The error message
     */
    DATABASE_INSUFFICIENT_MEMORY: 'error.core-api.database_insufficient_memory',
    /**
     * Interpolation :
     * - table : The name of the table
     * - database : The name of the database
     * - error : The error message
     */
    DATABASE_INSUFFICIENT_STORAGE: 'error.core-api.database_insufficient_storage',
    /**
     * Interpolation :
     * - table : The name of the table
     * - database : The name of the database
     * - error : The error message
     */
    DATABASE_QUERY_TIMEOUT: 'error.core-api.database_query_timeout',
    /**
     * Interpolation :
     * - table : The name of the table
     * - database : The name of the database
     * - error : The error message
     */
    DATABASE_TRANSACTION_LOG_FULL: 'error.core-api.database_transaction_log_full',
    /**
     * Interpolation :
     * - table : The name of the table
     * - database : The name of the database
     * - error : The error message
     */
    DATABASE_DATA_TOO_LARGE: 'error.core-api.database_data_too_large',
    /**
     * Interpolation :
     * - table : The name of the table
     * - database : The name of the database
     * - error : The error message
     */
    DATABASE_PERMISSION_DENIED: 'error.core-api.database_permission_denied',
    /**
     * Interpolation :
     * - name : The name of the storage
     */
    AZ_STORAGE_ALREADY_REGISTERED: 'error.core-api.azure_storage_already_registered',
    /**
     * Interpolation :
     * - name : The name of the storage
     */
    AZ_STORAGE_NOT_REGISTERED: 'error.core-api.azure_storage_not_registered',
    /**
     * Interpolation :
     * - accountName : The name of account storage service in Azure
     */
    AZ_STORAGE_LIST_CONTAINER_FAILED: 'error.core-api.azure_storage_list_container_failed',
    /**
     * Interpolation :
     * - accountName : The name of account storage service in Azure
     * - containerName : The name of the container
     */
    AZ_STORAGE_CREATE_FAILED: 'error.core-api.azure_storage_create_failed',
    /**
     * Interpolation :
     * - accountName : The name of account storage service in Azure
     * - containerName : The name of the container
     */
    AZ_STORAGE_DELETE_FAILED: 'error.core-api.azure_storage_delete_failed',
    /**
     * Interpolation :
     * - accountName : The name of account storage service in Azure
     * - containerName : The name of the container
     */
    AZ_STORAGE_GET_CONTAINER_FAILED: 'error.core-api.azure_storage_get_container_failed',
    /**
     * Interpolation :
     * - accountName : The name of account storage service in Azure
     * - containerName : The name of the container
     * - blobName : The name of the blob
     */
    AZ_STORAGE_BLOB_UPLOAD_FAILED: 'error.core-api.azure_storage_blob_upload_failed',
    /**
     * Interpolation :
     * - accountName : The name of account storage service in Azure
     * - containerName : The name of the container
     * - blobName : The name of the blob
     */
    AZ_STORAGE_BLOB_DOWNLOAD_FAILED: 'error.core-api.azure_storage_blob_download_failed',
    /**
     * Interpolation :
     * - accountName : The name of account storage service in Azure
     * - containerName : The name of the container
     * - blobName : The name of the blob
     */
    AZ_STORAGE_BLOB_DELETE_FAILED: 'error.core-api.azure_storage_blob_delete_failed',
    /**
     * Interpolation :
     * - accountName : The name of account storage service in Azure
     * - containerName : The name of the container
     * - blobName : The name of the blob
     */
    AZ_STORAGE_BLOB_GET_FAILED: 'error.core-api.azure_storage_blob_get_failed',
    /**
     * Interpolation :
     * - accountName : The name of account storage service in Azure
     * - containerName : The name of the container
     */
    AZ_STORAGE_CONTAINER_LIST_FAILED: 'error.core-api.azure_storage_container_list_failed',

    CRUD_DELETE_NO_SEARCH: 'error.core-api.crud_delete_no_search',
    CRUD_UPDATE_NO_SEARCH: 'error.core-api.crud_update_no_search',
    REQUEST_FILE_TOO_LARGE: 'error.core-api.request_file_too_large',
    REQUEST_FILES_LIMIT: 'error.core-api.request_files_limit'
};

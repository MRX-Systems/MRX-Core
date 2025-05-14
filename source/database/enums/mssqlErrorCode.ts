import { databaseKeyError } from './databaseKeyError';

/** MSSQL error codes with their corresponding error key. */
export const mssqlErrorCode = {
    0: databaseKeyError.mssqlQueryError,
    4060: databaseKeyError.mssqlDatabaseAccessDenied,
    18452: databaseKeyError.mssqlDatabaseAuthorizationFailed,
    18456: databaseKeyError.mssqlDatabaseAuthorizationFailed,
    102: databaseKeyError.mssqlDatabaseSyntaxError,
    207: databaseKeyError.mssqlDatabaseColumnNotFound,
    208: databaseKeyError.mssqlTableNotFound,
    209: databaseKeyError.mssqlDatabaseAmbiguousColumn,
    2627: databaseKeyError.mssqlDatabaseDuplicateKey,
    547: databaseKeyError.mssqlDatabaseForeignKeyViolation,
    2601: databaseKeyError.mssqlDatabaseUniqueConstraintViolation,
    1205: databaseKeyError.mssqlDatabaseDeadlockDetected,
    1222: databaseKeyError.mssqlDatabaseResourceLocked,
    3928: databaseKeyError.mssqlDatabaseTransactionAborted,
    701: databaseKeyError.mssqlDatabaseInsufficientMemory,
    1105: databaseKeyError.mssqlDatabaseInsufficientStorage,
    8645: databaseKeyError.mssqlDatabaseQueryTimeout,
    9002: databaseKeyError.mssqlDatabaseTransactionLogFull,
    8152: databaseKeyError.mssqlDatabaseDataTooLarge,
    229: databaseKeyError.mssqlDatabasePermissionDenied,
    544: databaseKeyError.mssqlDatabaseIdentityInsertNotAllowed,
    8102: databaseKeyError.mssqlDatabaseCannotUpdateIdentityColumn
} as const;
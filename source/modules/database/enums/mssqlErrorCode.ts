import { databaseErrorKeys } from './databaseErrorKeys';

export const mssqlErrorCode = {
    0: databaseErrorKeys.mssqlQueryError,
    4060: databaseErrorKeys.mssqlDatabaseAccessDenied,
    18452: databaseErrorKeys.mssqlDatabaseAuthorizationFailed,
    18456: databaseErrorKeys.mssqlDatabaseAuthorizationFailed,
    102: databaseErrorKeys.mssqlDatabaseSyntaxError,
    207: databaseErrorKeys.mssqlDatabaseColumnNotFound,
    208: databaseErrorKeys.mssqlTableNotFound,
    209: databaseErrorKeys.mssqlDatabaseAmbiguousColumn,
    2627: databaseErrorKeys.mssqlDatabaseDuplicateKey,
    547: databaseErrorKeys.mssqlDatabaseForeignKeyViolation,
    2601: databaseErrorKeys.mssqlDatabaseUniqueConstraintViolation,
    1205: databaseErrorKeys.mssqlDatabaseDeadlockDetected,
    1222: databaseErrorKeys.mssqlDatabaseResourceLocked,
    3928: databaseErrorKeys.mssqlDatabaseTransactionAborted,
    701: databaseErrorKeys.mssqlDatabaseInsufficientMemory,
    1105: databaseErrorKeys.mssqlDatabaseInsufficientStorage,
    8645: databaseErrorKeys.mssqlDatabaseQueryTimeout,
    9002: databaseErrorKeys.mssqlDatabaseTransactionLogFull,
    8152: databaseErrorKeys.mssqlDatabaseDataTooLarge,
    229: databaseErrorKeys.mssqlDatabasePermissionDenied,
    544: databaseErrorKeys.mssqlDatabaseIdentityInsertNotAllowed,
    8102: databaseErrorKeys.mssqlDatabaseCannotUpdateIdentityColumn
} as const;
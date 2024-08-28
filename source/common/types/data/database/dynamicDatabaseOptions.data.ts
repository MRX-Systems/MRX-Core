import type { BetterSQLiteDatabaseOptions, MSSQLDatabaseOptions, PostgresDatabaseOptions } from './creator/index.ts';

/**
 * The dynamic database configuration if the database name is undefined.
 * Allow to create a dynamic database based on the request header in the factory database.
 */
export interface DynamicDatabaseOptions {
    /**
     * The header key to get the database name. (default: 'database-using')
     */
    headerKey?: string,
    /**
     * The database type.
     */
    databaseType: 'postgres' | 'better-sqlite' | 'mssql',
    /**
     * The database options.
     */
    databaseOptions: Omit<PostgresDatabaseOptions, 'databaseName'>
                    | Omit<BetterSQLiteDatabaseOptions, 'databaseName'>
                    | Omit<MSSQLDatabaseOptions, 'databaseName'>;
}

import type { MSSQLDatabaseOptions } from '#/modules/database/types';

/**
 * Options to configure the dynamic database selector plugin.
 *
 * @example
 * ```ts
 * const options: DbSelectorOptions = {
 *   connectionConfig: {
 *     host: 'localhost',
 *     port: 1433,
 *     user: 'sa',
 *     password: 'Password123',
 *     encrypt: true
 *   },
 *   headerKey: 'x-database-name'
 * };
 * ```
 */
export interface DbSelectorOptions<THeaderKeyName extends string = 'database-using'> {
    /**
     * Options for the database connection
     */
    readonly connectionConfig: Omit<MSSQLDatabaseOptions, 'databaseName'>;
    /**
     * The name of the key to be used in the header to select the database
     * @example 'x-database-name'
     *
     * @defaultValue 'database-using'
     */
    readonly headerKey?: THeaderKeyName;
}
import type { MSSQLDatabaseOptions } from '#/database/types';

/**
 * Options to configure the dynamic database selector plugin.
 *
 * @example
 * ```typescript
 * const options: DynamicDatabaseSelectorPluginOptions = {
 *   baseDatabaseConfig: {
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
export interface DynamicDatabaseSelectorPluginOptions {
    /**
     * Options for the database connection
     * @see {@link MSSQLDatabaseOptions}
     */
    baseDatabaseConfig: Omit<MSSQLDatabaseOptions, 'databaseName'>;
    /**
     * The name of the key to be used in the header to select the database
     * @example 'x-database-name'
     */

    headerKey?: string;
}
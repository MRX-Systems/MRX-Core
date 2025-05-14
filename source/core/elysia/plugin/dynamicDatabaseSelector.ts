import { SingletonManager } from '@basalt-lab/basalt-helper/util';
import { Elysia, t } from 'elysia';

import { MSSQL, type MSSQLDatabaseOptions } from '#/core/database/mssql';
import { CoreError } from '#/error/coreError';
import { elysiaKeyError } from '#/error/key/elysiaKeyError';

/**
 * Options to configure the dynamic database selector plugin.
 *
 * This interface defines the configuration parameters required for setting up
 * the dynamic database selector, including base database configuration and
 * customizable header key for database selection.
 *
 * ### Key Configuration Areas:
 * - Base database connection settings (excluding database name)
 * - Custom header key for database selection in requests
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
     * Configuration for the base database connection.
     *
     * This property contains the shared database configuration settings that will be used
     * for all database connections. The database name is excluded as it will be provided
     * dynamically through request headers.
     *
     * @see {@link MSSQLDatabaseOptions} for detailed configuration options
     */
    baseDatabaseConfig: Omit<MSSQLDatabaseOptions, 'databaseName'>;

    /**
     * The custom header key to use for determining which database to connect to.
     *
     * This allows clients to specify which database to use by including this header
     * in their requests. If not specified, the default header key 'database-using' will be used.
     *
     * @defaultValue 'database-using'
     */
    headerKey?: string;
}

/**
 * The `dynamicDatabaseSelectorPlugin` provides dynamic database selection capabilities for Elysia applications.
 * It enables switching between different MSSQL databases at runtime based on request headers, facilitating
 * multi-tenant or dynamically configurable database scenarios.
 *
 * When a request is received with the configured database header, the plugin:
 * 1. Extracts the database name from the request header
 * 2. Checks if a connection to that database already exists
 * 3. Creates a new connection if needed, or reuses an existing one
 * 4. Makes the database connection available through the request context
 *
 * The plugin uses a singleton pattern to efficiently manage database connections, ensuring
 * that connections are reused when possible rather than creating new connections for each request.
 *
 * ### Key Features:
 * - Dynamic database selection based on request headers
 * - Connection pooling through singleton management
 * - Automatic connection creation for new databases
 * - Type-safe access to database connections in request handlers
 * - Request validation for required headers
 *
 * @param options - The configuration options for the plugin
 *
 * @returns An Elysia plugin that adds dynamic database selection functionality
 *
 * @example
 * ```typescript
 * // Create and register the plugin
 * const app = new Elysia()
 *   .use(dynamicDatabaseSelectorPlugin({
 *     baseDatabaseConfig: {
 *       host: 'localhost',
 *       port: 1433,
 *       user: 'sa',
 *       password: 'Password123',
 *       encrypt: true
 *     },
 *     headerKey: 'x-tenant-db'
 *   }))
 *
 *   // Use the dynamic database in a route handler
 *   .get('/data',
 *     async ({ hasDynamicDatabaseSelector }) => {
 *       const { dynamicDB } = await hasDynamicDatabaseSelector();
 *       const users = await dynamicDB.getRepository('users').find();
 *       return users;
 *     },
 *     {
 *       headers: t.Object({
 *         'x-tenant-db': t.String()
 *       })
 *     }
 *   );
 * ```
 */
export const dynamicDatabaseSelectorPlugin = (options: DynamicDatabaseSelectorPluginOptions) => new Elysia({
    name: 'dynamicDatabaseSelectorPlugin'
})
    .model({
        databaseUsingHeader: t.Object({
            [options.headerKey || 'database-using']: t.String()
        })
    })

    .macro({
        hasDynamicDatabaseSelector: {
            async resolve({ headers }) {
                const databaseName = headers[options.headerKey || 'database-using'];
                if (!databaseName)
                    throw new CoreError({
                        key: elysiaKeyError.dynamicDatabaseKeyNotFound,
                        message: 'Dynamic Database key not found in the request headers.',
                        httpStatusCode: 400
                    });
                if (!SingletonManager.has(`database:${databaseName}`)) {
                    SingletonManager.register(`database:${databaseName}`, MSSQL, {
                        ...options.baseDatabaseConfig,
                        databaseName
                    });
                    await SingletonManager.get<MSSQL>(`database:${databaseName}`).connect();
                }
                return {
                    dynamicDB: SingletonManager.get<MSSQL>(`database:${databaseName}`)
                };
            }
        }
    })
    .as('scoped');
import { Elysia, t } from 'elysia';

import { MSSQL } from '#/database/mssql';
import { CoreError } from '#/error/coreError';
import { SingletonManager } from '#/singletonManager/singletonManager';
import { elysiaErrorKeys } from './enums/elysiaErrorKeys';
import type { DynamicDatabaseSelectorPluginOptions } from './types/dynamicDatabaseSelectorPluginOptions';

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
 * @param options - The configuration options for the plugin
 *
 * @returns An {@link Elysia} plugin that adds dynamic database selection functionality
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
                        key: elysiaErrorKeys.dynamicDatabaseKeyNotFound,
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
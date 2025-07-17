import type { TObject, TString } from '@sinclair/typebox';
import { Elysia, t } from 'elysia';

import { MSSQL } from '#/modules/database/mssql';
import { CoreError } from '#/error/coreError';
import { SingletonManager } from '#/modules/singletonManager/singletonManager';
import { errorKeys } from './enums/errorKeys';
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
 * @param options - The configuration options for the plugin
 *
 * @returns An Elysia plugin that adds dynamic database selection functionality
 *
 * @example
 * Create and register the plugin
 * ```ts
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
 *     async ({ dynamicDB }) => {
 *       const users = await dynamicDB.getRepository('users').find();
 *       return users;
 *     },
 *     {
 *       hasDynamicDatabaseSelector: true,
 *       headers: 'databaseUsingHeader',
 *     }
 *   );
 * ```
 */
export const dynamicDatabaseSelectorPlugin = <const THeaderKeyName extends string = 'database-using'>(options: DynamicDatabaseSelectorPluginOptions<THeaderKeyName>) => {
    const keyName = (options.headerKey ?? 'database-using') as THeaderKeyName;

    return new Elysia({
        name: 'dynamicDatabaseSelectorPlugin'
    })
        .model({
            databaseUsingHeader: t.Object({
                [keyName]: t.String({
                    description: 'Name of the database to use for the request',
                    example: 'my_database'
                })
            }) as TObject<Record<THeaderKeyName, TString>>
        })
        .macro({
            hasDynamicDatabaseSelector: {
                async resolve({ headers }) {
                    const databaseName = headers[keyName];
                    if (!databaseName)
                        throw new CoreError({
                            key: errorKeys.dynamicDatabaseKeyNotFound,
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
};


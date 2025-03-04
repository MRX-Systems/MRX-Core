import { SingletonManager } from '@basalt-lab/basalt-helper/util';
import { Elysia, t } from 'elysia';

import { MSSQL, type MSSQLDatabaseOptions } from '#/core/database/mssql';
import { ELYSIA_KEY_ERROR } from '#/error/key/elysiaKeyError';
import { CoreError } from '#/error/coreError';

export interface DynamicDatabaseSelectorPluginOptions {
    baseDatabaseConfig: Omit<MSSQLDatabaseOptions, 'databaseName'>;
    headerKey?: string;
}

/**
 * This plugin aims to add the auth database to the context by default
 * and allows switching databases based on the 'database-using' header of the request and adds the client database to the context.
 *
 * @param options - The options for the plugin ({@link DynamicDatabaseSelectorPluginOptions})
 *
 * @returns The Elysia instance with the plugin added
 */
export const dynamicDatabaseSelectorPlugin = (options: DynamicDatabaseSelectorPluginOptions): typeof app => {
    const app = new Elysia({
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
                            key: ELYSIA_KEY_ERROR.DYNAMIC_DATABASE_KEY_NOT_FOUND,
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
        });
    return app;
};


import { SingletonManager } from '@basalt-lab/basalt-helper/util';
import { Elysia, t } from 'elysia';

import { CoreError } from '#/error/coreError';
import { MSSQL } from '#/database/mssql';
import { elysiaKeyError } from './enums/elysiaKeyError';
import type { DynamicDatabaseSelectorPluginOptions } from './types/dynamicDatabaseSelectorPluginOptions';

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
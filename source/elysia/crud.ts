import type { Static, TObject, TSchema } from '@sinclair/typebox';
import { Elysia, t } from 'elysia';

import type { MSSQL } from '#/database/mssql';
import { CoreError } from '#/error/coreError';
import type { Filter } from '#/repository/types/filter';
import type { SelectedFields } from '#/repository/types/selectedFields';
import { SingletonManager } from '#/singletonManager/singletonManager';
import { advancedSearchPlugin, createBaseSearchSchema } from './advancedSearch';
import { dynamicDatabaseSelectorPlugin } from './dynamicDatabaseSelector';
import { elysiaErrorKeys } from './enums/elysiaErrorKeys';
import type { CrudOptions } from './types/crudOptions';
import type { CRUDRoutes } from './types/crudRoutes';
import type { DynamicDatabaseSelectorPluginOptions } from './types/dynamicDatabaseSelectorPluginOptions';


export const createResponse200Schema = <TInferedObject extends TObject>(schema: TInferedObject) => {
    const { properties } = schema;

    const contentSchema = {} as Record<string, TSchema>;

    for (const key in properties)
        contentSchema[key] = t.Union([
            properties[key],
            t.Undefined(),
            t.Null(),
            t.Literal('')
        ]);

    return t.Object({
        message: t.String(),
        content: t.Array(t.Partial(t.Object(contentSchema)))
    });
};

export const createInsertBodySchema = <TInferedObject extends TObject>(schema: TInferedObject, requiredPropertiesSchema?: (keyof Static<TInferedObject>)[]) => {
    const { properties } = schema;

    const contentSchema = {} as Record<string, TSchema>;

    for (const key in properties)
        contentSchema[key] = requiredPropertiesSchema?.includes(key)
            ? properties[key]
            : t.Optional(properties[key]);

    return t.Object(contentSchema);
};

const _addModels = <TInferedObject extends TObject, KEnumPermission extends string>(enabledRoutes: CRUDRoutes[], options: CrudOptions<TInferedObject, KEnumPermission>) => {
    const { baseSchema, tableName, insertPropertiesSchemaRequired } = options;

    // Initialize plugin with common response schema
    const plugin = new Elysia().model({
        [`crud${tableName}Response200`]: createResponse200Schema(baseSchema)
    });

    // Map of route types to their corresponding model definitions
    const routeModelMap: Partial<Record<CRUDRoutes, () => void>> = {
        insert: () => plugin.model({
            [`crud${tableName}InsertBody`]: createInsertBodySchema(baseSchema, insertPropertiesSchemaRequired)
        }),
        update: () => plugin.model({
            [`crud${tableName}UpdateBody`]: t.Partial(baseSchema)
        }),
        count: () => plugin.model({
            [`crud${tableName}CountResponse200`]: t.Object({
                message: t.String(),
                content: t.Number()
            })
        })
    };

    // Add route-specific models
    enabledRoutes.forEach((route) => {
        if (route in routeModelMap)
            routeModelMap[route]?.();
    });

    // Routes that require ID parameter
    const routesWithIdParam = ['findOne', 'deleteOne', 'updateOne'] as const;

    // Add ID parameter model if any route requires it
    if (routesWithIdParam.some((route) => enabledRoutes.includes(route)))
        plugin.model({
            [`crud${tableName}IdParam`]: t.Object({
                id: t.Union([t.String(), t.Number()])
            })
        });
    return plugin;
};

const _getEnabledRoutes = (includedRoutes: CRUDRoutes[] = [], excludedRoutes: CRUDRoutes[] = []): CRUDRoutes[] => {
    // Define all available routes as a constant to improve maintainability
    const allRoutes: CRUDRoutes[] = ['insert', 'find', 'findOne', 'update', 'updateOne', 'delete', 'deleteOne', 'count'];

    // Start with either the included routes or all routes
    const enabledRoutes = includedRoutes.length > 0
        ? includedRoutes
        : allRoutes;

    // Filter out excluded routes
    return excludedRoutes.length > 0
        ? enabledRoutes.filter((route) => !excludedRoutes.includes(route))
        : enabledRoutes;
};

const _injectDynamicDbInContext = (database: string | DynamicDatabaseSelectorPluginOptions) => {
    const plugin = new Elysia();
    const isDynamicDatabase = typeof database !== 'string';

    if (!isDynamicDatabase)
        // Static database configuration
        plugin.resolve(() => ({
            dynamicDB: SingletonManager.get<MSSQL>(`database:${database}`)
        }));
    else
        // Dynamic database configuration
        plugin.use(dynamicDatabaseSelectorPlugin({
            baseDatabaseConfig: database.baseDatabaseConfig,
            headerKey: database.headerKey || 'database-using'
        }));
    return plugin.as('scoped');
};

const handlerDefinition = {
    insertHandler: async (ctx: Record<string, unknown>, tableName: string) => {
        const db = (ctx as { dynamicDB: MSSQL }).dynamicDB;
        const repo = db.getRepository(tableName);

        const { body } = ctx as { body: Partial<unknown> };
        const data = await repo.insert(body);
        return {
            message: `Inserted record for ${tableName}`,
            content: data
        };
    },

    findHandler: async (ctx: Record<string, unknown>, tableName: string) => {
        const db = (ctx as { dynamicDB: MSSQL }).dynamicDB;
        const repo = db.getRepository(tableName);

        const data = await repo.find({
            filter: ctx.advancedSearch as Filter<unknown>[],
            selectedFields: ctx.selectedFields as SelectedFields<unknown>,
            limit: (ctx.pagination as { limit: number; offset: number }).limit,
            offset: (ctx.pagination as { limit: number; offset: number }).offset
        });
        return {
            message: `Found ${data.length} records for ${tableName}`,
            content: data
        };
    },

    findOneHandler: async (ctx: Record<string, unknown>, tableName: string) => {
        const db = (ctx as unknown as { dynamicDB: MSSQL }).dynamicDB;
        const repo = db.getRepository(tableName);
        const table = db.getTable(tableName);
        const primary = table.primaryKey;

        const { id } = ctx.params as { id: string | number };

        const data = await repo.findOne({
            filter: {
                [primary[0]]: id
            } as Filter<unknown>
        });
        return {
            message: `Found record for ${tableName}`,
            content: data
        };
    },

    countHandler: async (ctx: Record<string, unknown>, tableName: string) => {
        const db = (ctx as { dynamicDB: MSSQL }).dynamicDB;
        const repo = db.getRepository(tableName);
        const count = await repo.count({
            filter: ctx.advancedSearch as Filter<unknown>[]
        });
        return {
            message: `${count} records found for ${tableName}`,
            content: count
        };
    },

    updateHandler: async (ctx: Record<string, unknown>, tableName: string) => {
        const db = (ctx as { dynamicDB: MSSQL }).dynamicDB;
        const repo = db.getRepository(tableName);

        if (!ctx.advancedSearch || (ctx.advancedSearch as Filter<unknown>[]).length === 0 || !(ctx.advancedSearch as Filter<unknown>[])[0])
            throw new CoreError({
                key: elysiaErrorKeys.needAdvancedSearch,
                message: 'You need to provide advanced search to update records. It\'s dangerous to update all records.',
                httpStatusCode: 400
            });

        const data = await repo.update((ctx.body as Record<string, unknown>), {
            filter: ctx.advancedSearch as Filter<unknown>[],
            selectedFields: ctx.selectedField as SelectedFields<unknown>
        });

        return {
            message: `Updated ${data.length} records for ${tableName}`,
            content: data
        };
    },

    updateOneHandler: async (ctx: Record<string, unknown>, tableName: string) => {
        const db = (ctx as { dynamicDB: MSSQL }).dynamicDB;
        const repo = db.getRepository(tableName);
        const table = db.getTable(tableName);
        const primary = table.primaryKey;

        const { id } = ctx.params as { id: string | number };

        const data = await repo.update(ctx.body as Record<string, unknown>, {
            filter: {
                [primary[0]]: id
            } as Filter<unknown>
        });

        return {
            message: `Updated record for ${tableName}`,
            content: data
        };
    },

    deleteHandler: async (ctx: Record<string, unknown>, tableName: string) => {
        const db = (ctx as { dynamicDB: MSSQL }).dynamicDB;
        const repo = db.getRepository(tableName);

        if (!ctx.advancedSearch || (ctx.advancedSearch as Filter<unknown>[]).length === 0 || !(ctx.advancedSearch as Filter<unknown>[])[0])
            throw new CoreError({
                key: elysiaErrorKeys.needAdvancedSearch,
                message: 'You need to provide advanced search to delete records. It\'s dangerous to delete all records.',
                httpStatusCode: 400
            });

        const data = await repo.delete({
            filter: ctx.advancedSearch as Filter<unknown>[],
            selectedFields: ctx.selectedFields as SelectedFields<unknown>
        });

        return {
            message: `Deleted ${data.length} records for ${tableName}`,
            content: data
        };
    },

    deleteOneHandler: async (ctx: Record<string, unknown>, tableName: string) => {
        const db = (ctx as { dynamicDB: MSSQL }).dynamicDB;
        const repo = db.getRepository(tableName);
        const table = db.getTable(tableName);
        const primary = table.primaryKey;

        const { id } = ctx.params as { id: string | number };

        const data = await repo.delete({
            filter: {
                [primary[0]]: id
            } as Filter<unknown>
        });

        return {
            message: `Deleted record for ${tableName}`,
            content: data
        };
    }
} as const;

const _addRoutes = <TInferedObject extends TObject>
(
    enabledRoutes: CRUDRoutes[],
    tableName: string,
    baseSchema: TInferedObject,
    isDynamicDatabase: boolean,
    operationsPermissions: Partial<Record<CRUDRoutes, string[]>>
) => (app: Elysia) => {
    const routesMethods: Partial<Record<CRUDRoutes, 'post' | 'get' | 'patch' | 'delete'>> = {
        insert: 'post',
        find: 'get',
        findOne: 'get',
        count: 'get',
        update: 'patch',
        updateOne: 'patch',
        delete: 'delete',
        deleteOne: 'delete'
    };

    const routesPath: Partial<Record<CRUDRoutes, string>> = {
        insert: '/',
        find: '/',
        findOne: '/:id',
        count: '/count',
        update: '/',
        updateOne: '/:id',
        delete: '/',
        deleteOne: '/:id'
    };

    const hasAdvancedSearch = enabledRoutes.includes('find') || enabledRoutes.includes('count') || enabledRoutes.includes('update') || enabledRoutes.includes('delete');

    if (hasAdvancedSearch)
        app.use(advancedSearchPlugin({
            schemaName: tableName,
            baseSchema
        }));


    for (const route of enabledRoutes) {
        const method = routesMethods[route];
        const path = routesPath[route];

        if (method && path) {
            const handler = handlerDefinition[`${route}Handler`];

            const definition = {
                ...(route === 'findOne' || route === 'deleteOne' || route === 'updateOne'
                    ? { params: `crud${tableName}IdParam` as unknown as TObject }
                    : {}
                ),

                ...(route === 'count' || route === 'update' || route === 'delete'
                    ? { query: createBaseSearchSchema(baseSchema) } // can't use ref (https://discord.com/channels/1044804142461362206/1323026325531000842)
                    : route === 'find'
                        ? { query: createBaseSearchSchema(baseSchema) } // can't use ref (https://discord.com/channels/1044804142461362206/1323026325531000842)
                        : {}
                ),

                ...(route === 'insert' || route === 'update' || route === 'updateOne'
                    ? { body: `crud${tableName}${route === 'insert' ? 'Insert' : 'Update'}Body` as unknown as TObject }
                    : {}
                ),

                response: `crud${tableName}${route === 'count' ? 'Count' : ''}Response200` as unknown as TObject,
                hasAdvancedSearch: true as unknown as never,
                hasDynamicDatabaseSelector: isDynamicDatabase as unknown as never,
                needsOnePermission: operationsPermissions[route] || []
            };

            app[method](path, (ctx) => handler(ctx, tableName), definition);
        }
    }
    return app;
};

export const crudPlugin = <
    TInferedObject extends TObject,
    KEnumPermission extends string
>(options: CrudOptions<TInferedObject, KEnumPermission>) => {
    const enabledRoutes = _getEnabledRoutes(options.includedRoutes, options.excludedRoutes);
    const app = new Elysia({
        name: `crudPlugin[${options.tableName}]`,
        tags: [options.tableName]
    })
        .use(_addModels(enabledRoutes, options))
        .use(options.permissionConfig.permissionsPlugin);
    app
        .use(_injectDynamicDbInContext(options.database))
        .use(_addRoutes(
            enabledRoutes,
            options.tableName,
            options.baseSchema,
            !(typeof options.database === 'string'),
            options.permissionConfig.operationsPermissions
        ));
    return app;
};
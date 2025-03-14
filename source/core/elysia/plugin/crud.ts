import { SingletonManager } from '@basalt-lab/basalt-helper/util';
import type { Static, TObject, TSchema } from '@sinclair/typebox';
import { Elysia, t, type Context, type DefinitionBase, type EphemeralType, type MetadataBase, type RouteBase, type RouteSchema, type SingletonBase } from 'elysia';

import type { MSSQL } from '#/core/database/mssql';
import { CoreError } from '#/error/coreError';
import { ELYSIA_KEY_ERROR } from '#/error/key/elysiaKeyError';
import type { AdvancedSearch } from '#/types/data/advancedSearch';
import { advancedSearchPlugin, buildBaseSearchSchema, buildBaseSearchSchemaWithPagination } from './advancedSearch';
import { dynamicDatabaseSelectorPlugin, type DynamicDatabaseSelectorPluginOptions } from './dynamicDatabaseSelector';

/**
 * Type definition to represent all available CRUD operations.
 */
type CRUDRoutes = 'insert' | 'find' | 'findOne' | 'update' | 'updateOne' | 'delete' | 'deleteOne' | 'count';

/**
 * Configuration options for the CRUD plugin.
 *
 * @typeParam TInferedObject - The inferred schema type for the base object to generate CRUD operations for.
 */
interface CrudOptions<TInferedObject extends TObject> {
    /**
     * Name is used to identify the plugin and get the repository.
     */
    name: string;

    /**
     * Database is a parameter where you either provide the raw database name to use
     * or provide a configuration object for the dynamic database selector plugin.
     */
    database: string | DynamicDatabaseSelectorPluginOptions;

    /**
     * The TypeBox schema to build the CRUD operations for.
     */
    baseSchema: TInferedObject;

    /**
     * Specifies which properties are required for the insert operation.
     * If not provided, all properties are optional.
     */
    insertPropertiesSchemaRequired?: (keyof Static<TInferedObject>)[];

    /**
     * Specifies which CRUD routes should be included.
     * If empty, all routes are included by default.
     */
    includedRoutes?: CRUDRoutes[];

    /**
     * Specifies which CRUD routes should be excluded.
     */
    excludedRoutes?: CRUDRoutes[];

    /**
     * Permissions plugin to use for the CRUD operations.
     * This plugin should provide macros for permission checking.
     */
    permissionsPlugin: Elysia<
        '',
        SingletonBase,
        DefinitionBase,
        MetadataBase & {
            schema: RouteSchema;
            macro: Partial<{
                readonly needsOnePermission: string[];
                readonly needsMultiplePermissions: string[];
            }>;
            macroFn: {
                readonly needsOnePermission: (permissions: string[]) => {
                    beforeHandle: (ctx: Context) => Promise<void>;
                };
                readonly needsMultiplePermissions: (
                    permissions: string[]
                ) => {
                    beforeHandle: (ctx: Context) => Promise<void>
                };
            }
        },
        RouteBase,
        EphemeralType,
        EphemeralType
    >

    /**
     * Permissions associated with each CRUD operation.
     * Each operation can have multiple permission strings that will be checked.
     */
    operationsPermissions: Partial<Record<CRUDRoutes, string[]>>;
}

/**
 * Determines which routes should be enabled based on included and excluded routes.
 *
 * @param includedRoutes - List of routes to include ({@link CRUDRoutes})
 * @param excludedRoutes - List of routes to exclude ({@link CRUDRoutes})
 *
 * @returns Array of enabled routes
 */
function _getEnabledRoutes(includedRoutes: CRUDRoutes[], excludedRoutes: CRUDRoutes[]): CRUDRoutes[] {
    let enabledRoutes = ['insert', 'find', 'findOne', 'update', 'updateOne', 'delete', 'deleteOne', 'count'] as CRUDRoutes[];
    if (includedRoutes && includedRoutes.length > 0)
        enabledRoutes = includedRoutes;
    if (excludedRoutes && excludedRoutes.length > 0)
        enabledRoutes = enabledRoutes.filter((route) => !excludedRoutes.includes(route));
    return enabledRoutes;
}

/**
 * Creates a response schema for the CRUD plugin operations.
 *
 * This function builds a TypeBox schema that represents the standard response format
 * for CRUD operations, handling null and undefined values appropriately.
 *
 * @typeParam TInferedObject - The inferred schema type for the base object.
 * @param schema - The schema to build the response schema for. ({@link TInferedObject})
 *
 * @returns TypeBox schema for the standard CRUD operation response
 */
export const buildResponse200Schema = <TInferedObject extends TObject>(schema: TInferedObject): typeof crudResponse200Schema => {
    const { properties } = schema;

    const contentSchema = {} as Record<string, TSchema>;

    for (const key in properties)
        contentSchema[key] = t.Union([
            properties[key],
            t.Undefined(),
            t.Null()
        ]);

    const crudResponse200Schema = t.Object({
        message: t.String(),
        content: t.Array(t.Partial(t.Object(contentSchema)))
    });
    return crudResponse200Schema;
};

/**
 * Creates an insert body schema for the CRUD plugin.
 *
 * This function builds a body schema for insert operations, applying required
 * constraints to specified properties while leaving others optional.
 *
 * @typeParam TInferedObject - The inferred schema type for the base object.
 * @param schema - The schema to build the insert body schema from. ({@link TInferedObject})
 * @param requiredPropertiesSchema - Optional array of property keys that should be required.
 *
 * @returns TypeBox schema for the insert operation request body
 */
export const buildInsertBodySchema = <TInferedObject extends TObject>(schema: TInferedObject, requiredPropertiesSchema?: (keyof Static<TInferedObject>)[]): typeof bodySchema => {
    const { properties } = schema;

    const contentSchema = {} as Record<string, TSchema>;

    for (const key in properties)
        contentSchema[key] = requiredPropertiesSchema?.includes(key)
            ? properties[key]
            : t.Optional(properties[key]);

    const bodySchema = t.Object(contentSchema);
    return bodySchema;
};

/**
 * The CRUD plugin provides standardized REST endpoints for basic CRUD operations on a data model.
 *
 * This plugin automatically generates RESTful endpoints for Create, Read, Update, and Delete operations
 * based on a TypeBox schema. It integrates with permission checking, advanced search capabilities,
 * and supports both static and dynamic database connections.
 *
 * ### Key Features:
 * - Automatic generation of RESTful CRUD endpoints
 * - Integration with permission checking
 * - Support for advanced search and filtering
 * - Pagination for list operations
 * - Flexible route inclusion/exclusion
 * - Support for both static and dynamic database connections
 *
 * ### Overview:
 * @example
 * ```typescript
 * // Define a schema for your data model
 * const userSchema = t.Object({
 *   id: t.Number(),
 *   username: t.String(),
 *   email: t.String(),
 *   active: t.Boolean()
 * });
 *
 * // Create the permissions plugin (simplified example)
 * const permissionsPlugin = new Elysia({ name: 'permissions' })
 *   .macro({
 *     needsOnePermission: (permissions: string[]) => ({
 *       beforeHandle: (ctx) => { /* permission checking logic *\/ }
 *     })
 *     needsMultiplePermissions: (permissions: string[]) => ({
 *      beforeHandle: (ctx) => { /* permission checking logic *\/ }
 *    })
 *   });
 *
 * // Set up the CRUD plugin
 * const userCrud = crudPlugin({
 *   name: 'user',
 *   database: 'main_db',
 *   baseSchema: userSchema,
 *   permissionsPlugin,
 *   insertPropertiesSchemaRequired: ['username', 'email'],
 *   operationsPermissions: {
 *     insert: ['users:create'],
 *     update: ['users:edit'],
 *     delete: ['users:delete'],
 *     find: ['users:view']
 *   },
 *   excludedRoutes: ['count']
 * });
 *
 * // Use the CRUD plugin in your Elysia app
 * const app = new Elysia()
 *   .use(userCrud)
 *   .listen(3000);
 * ```
 *
 * @typeParam TInferedObject - The inferred schema type for the base object to generate CRUD operations for.
 * @param options - Configuration options for the CRUD plugin. ({@link CrudOptions})
 *
 * @returns An Elysia application instance with CRUD routes configured
 */
export const crudPlugin = <TInferedObject extends TObject>(options: CrudOptions<TInferedObject>): typeof app => {
    const { baseSchema } = options;
    type BaseModel = Static<typeof baseSchema>;

    const crudSearchSchemaWithPagination = buildBaseSearchSchemaWithPagination<TInferedObject>(baseSchema);
    const crudSearchSchema = buildBaseSearchSchema<TInferedObject>(baseSchema);

    const crudIdParamSchema = t.Object({
        id: t.Union([t.String(), t.Number()])
    });
    const crudInsertBodySchema = buildInsertBodySchema(baseSchema, options.insertPropertiesSchemaRequired);
    const crudUpdateBodySchema = t.Partial(baseSchema);
    const crudResponse200Schema = buildResponse200Schema(baseSchema);
    const crudCountResponse200Schema = t.Object({
        message: t.String(),
        content: t.Number()
    });

    const app = new Elysia({
        name: `crudPlugin-${options.name}`
    })
        .model({
            [`crud${options.name}IdParam`]: crudIdParamSchema,
            [`crud${options.name}InsertBody`]: crudInsertBodySchema,
            [`crud${options.name}UpdateBody`]: crudUpdateBodySchema,
            [`crud${options.name}Response200`]: crudResponse200Schema,
            [`crud${options.name}CountResponse200`]: crudCountResponse200Schema
        })
        .use(advancedSearchPlugin(options.name, baseSchema))
        .use(options.permissionsPlugin);

    const isDynamicDatabase = options.database && typeof options.database === 'object';

    const enabledRoutes = _getEnabledRoutes(options.includedRoutes || [], options.excludedRoutes || []);

    if (!isDynamicDatabase)
        app.resolve({ as: 'local' }, () => ({
            dynamicDB: SingletonManager.get<MSSQL>(`database:${options.database as string}`)
        }));
    else if (isDynamicDatabase)
        app.use(dynamicDatabaseSelectorPlugin({
            baseDatabaseConfig: (options.database as DynamicDatabaseSelectorPluginOptions).baseDatabaseConfig,
            headerKey: (options.database as DynamicDatabaseSelectorPluginOptions).headerKey || 'database-using'
        }));

    const base = isDynamicDatabase ? { hasDynamicDatabaseSelector: true } : {};

    if (enabledRoutes.includes('insert'))
        app.post('/insert', async (ctx): Promise<{ message: string; content: BaseModel[]; }> => {
            const db = (ctx as unknown as { dynamicDB: MSSQL }).dynamicDB;
            const repo = db.getRepository<BaseModel>(options.name);

            const data = await repo.insert(ctx.body);
            return {
                message: `Inserted record for ${options.name}`,
                content: data
            };
        }, {
            ...(options.operationsPermissions.insert
                ? { needsOnePermission: options.operationsPermissions.insert }
                :{}
            ),
            body: crudInsertBodySchema,
            response: {
                200: crudResponse200Schema
            },
            ...base as Record<string, unknown>
        });

    if (enabledRoutes.includes('find'))
        app.get('/find', async (ctx): Promise<{ message: string; content: BaseModel[]; }> => {
            const db = (ctx as unknown as { dynamicDB: MSSQL }).dynamicDB;
            const repo = db.getRepository<BaseModel>(options.name);

            const data = await repo.find({
                advancedSearch: ctx.advancedSearch,
                selectedFields: ctx.selectedFields,
                limit: (ctx.pagination as { limit: number; offset: number }).limit,
                offset: (ctx.pagination as { limit: number; offset: number }).offset
            });
            return {
                message: `Found ${data.length} records for ${options.name}`,
                content: data
            };
        }, {
            ...(options.operationsPermissions.find
                ? { needsOnePermission: options.operationsPermissions.find }
                :{}
            ),
            query: crudSearchSchemaWithPagination,
            hasAdvancedSearch: true,
            response: {
                200: crudResponse200Schema
            },
            ...base as Record<string, unknown>
        });

    if (enabledRoutes.includes('findOne'))
        app.get('/findOne/:id', async (ctx): Promise<{ message: string; content: BaseModel; }> => {
            const db = (ctx as unknown as { dynamicDB: MSSQL }).dynamicDB;
            const repo = db.getRepository<BaseModel>(options.name);
            const table = db.getTable(options.name);
            const primary = table.primaryKey;

            const data = await repo.findOne({
                advancedSearch: {
                    [primary[0]]: ctx.params.id
                } as AdvancedSearch<BaseModel>
            });
            return {
                message: `Found record for ${options.name}`,
                content: data
            };
        }, {
            ...(options.operationsPermissions.findOne
                ? { needsOnePermission: options.operationsPermissions.findOne }
                :{}
            ),
            params: crudIdParamSchema,
            ...base as Record<string, unknown>
        });

    if (enabledRoutes.includes('delete'))
        app.delete('/delete', async (ctx): Promise<{ message: string; content: BaseModel[]; }> => {
            const db = (ctx as unknown as { dynamicDB: MSSQL }).dynamicDB;
            const repo = db.getRepository<BaseModel>(options.name);

            if (!ctx.advancedSearch || ctx.advancedSearch.length === 0 || !ctx.advancedSearch[0])
                throw new CoreError({
                    key: ELYSIA_KEY_ERROR.NEED_ADVANCED_SEARCH,
                    message: 'You need to provide advanced search to delete records. It\'s dangerous to delete all records.',
                    httpStatusCode: 400
                });
            const data = await repo.delete({
                advancedSearch: ctx.advancedSearch,
                selectedFields: ctx.selectedFields
            });

            return {
                message: `Deleted ${data.length} records for ${options.name}`,
                content: data
            };
        }, {
            ...(options.operationsPermissions.delete
                ? { needsOnePermission: options.operationsPermissions.delete }
                :{}
            ),
            query: crudSearchSchema,
            hasAdvancedSearch: true,
            response: {
                200: crudResponse200Schema
            },
            ...base as Record<string, unknown>
        });

    if (enabledRoutes.includes('deleteOne'))
        app.delete('/deleteOne/:id', async (ctx): Promise<{ message: string; content: BaseModel; }> => {
            const db = (ctx as unknown as { dynamicDB: MSSQL }).dynamicDB;
            const repo = db.getRepository<BaseModel>(options.name);
            const table = db.getTable(options.name);
            const primary = table.primaryKey;

            const [data] = await repo.delete({
                advancedSearch: {
                    [primary[0]]: ctx.params.id
                } as AdvancedSearch<BaseModel>
            });

            return {
                message: `Deleted record for ${options.name}`,
                content: data
            };
        }, {
            ...(options.operationsPermissions.deleteOne
                ? { needsOnePermission: options.operationsPermissions.deleteOne }
                :{}
            ),
            params: crudIdParamSchema,
            ...base as Record<string, unknown>
        });

    if (enabledRoutes.includes('update'))
        app.patch('/update', async (ctx): Promise<{ message: string; content: BaseModel[]; }> => {
            const db = (ctx as unknown as { dynamicDB: MSSQL }).dynamicDB;
            const repo = db.getRepository<BaseModel>(options.name);

            if (!ctx.advancedSearch || ctx.advancedSearch.length === 0 || !ctx.advancedSearch[0])
                throw new CoreError({
                    key: ELYSIA_KEY_ERROR.NEED_ADVANCED_SEARCH,
                    message: 'You need to provide advanced search to update records. It\'s dangerous to update all records.',
                    httpStatusCode: 400
                });

            const data = await repo.update((ctx.body as Static<typeof crudUpdateBodySchema>), {
                advancedSearch: ctx.advancedSearch,
                selectedFields: ctx.selectedFields
            });

            return {
                message: `Updated ${data.length} records for ${options.name}`,
                content: data
            };
        }, {
            ...(options.operationsPermissions.update
                ? { needsOnePermission: options.operationsPermissions.update }
                :{}
            ),
            body: crudUpdateBodySchema,
            query: crudSearchSchema,
            hasAdvancedSearch: true,
            response: {
                200: crudResponse200Schema
            },
            ...base as Record<string, unknown>
        });

    if (enabledRoutes.includes('updateOne'))
        app.patch('/updateOne/:id', async (ctx): Promise<{ message: string; content: BaseModel; }> => {
            const db = (ctx as unknown as { dynamicDB: MSSQL }).dynamicDB;
            const repo = db.getRepository<BaseModel>(options.name);
            const table = db.getTable(options.name);
            const primary = table.primaryKey;

            const [data] = await repo.update((ctx.body as Static<typeof crudUpdateBodySchema>), {
                advancedSearch: {
                    [primary[0]]: ctx.params.id
                } as AdvancedSearch<BaseModel>
            });

            return {
                message: `Updated record for ${options.name}`,
                content: data
            };
        }, {
            ...(options.operationsPermissions.updateOne
                ? { needsOnePermission: options.operationsPermissions.updateOne }
                :{}
            ),
            params: crudIdParamSchema,
            body: crudUpdateBodySchema,
            ...base as Record<string, unknown>
        });

    if (enabledRoutes.includes('count'))
        app.get('/count', async (ctx): Promise<{ message: string; content: number; }> => {
            const db = (ctx as unknown as { dynamicDB: MSSQL }).dynamicDB;
            const repo = db.getRepository<BaseModel>(options.name);
            const count = await repo.count({
                advancedSearch: ctx.advancedSearch
            });
            return {
                message: `${count} records found for ${options.name}`,
                content: count
            };
        }, {
            ...(options.operationsPermissions.count
                ? { needsOnePermission: options.operationsPermissions.count }
                :{}
            ),
            query: crudSearchSchema,
            response: {
                200: crudCountResponse200Schema
            },
            hasAdvancedSearch: true,
            ...base as Record<string, unknown>
        });
    return app;
};

import type { Static, TObject } from '@sinclair/typebox';
import { Elysia, t } from 'elysia';

import type { MSSQL } from '#/core/database/mssql';
import type { AdvancedSearch } from '#/types/data/advancedSearch';
import { SingletonManager } from '@basalt-lab/basalt-helper/util';
import { advancedSearchPlugin, buildBaseSearchSchema, buildBaseSearchSchemaWithPagination } from './advancedSearch';
import { dynamicDatabaseSelectorPlugin, type DynamicDatabaseSelectorPluginOptions } from './dynamicDatabaseSelector';

// interface CrudOperationBase {
// }

interface CrudOptions<TInferedObject extends TObject> {
    /**
     * Name is used to identify the plugin and get the repository
     */
    name: string;
    /**
     * Database is a parameter where you either provide the raw database name to use
     * or provide a configuration object for the dynamic database selector plugin
     */
    database: string | DynamicDatabaseSelectorPluginOptions;
    baseSchema: TInferedObject;
    /**
     * Operation is a map of operations that the plugin will expose
     */
    operations?: {
        find?: false;
    };
}

export const crudPlugin = <TInferedObject extends TObject>(options: CrudOptions<TInferedObject>): typeof app => {
    const { baseSchema } = options;
    type BaseModel = Static<typeof baseSchema>;

    const crudResponse200Schema = t.Object({
        message: t.String(),
        content: t.Array(t.Partial(baseSchema))
    });

    const crudIdParamSchema = t.Object({
        id: t.Union([t.String(), t.Number()])
    });

    const app = new Elysia({
        name: `crudPlugin-${options.name}`
    })
        .model({
            [`crud${options.name}Response200`]: crudResponse200Schema,
            [`crud${options.name}IdParam`]: crudIdParamSchema
        })
        .use(advancedSearchPlugin(options.name, baseSchema));


    const findUseCase = async (ctx: Record<string, unknown>): Promise<{ message: string; content: BaseModel[]; }> => {
        const repo = (ctx as { dynamicDB: MSSQL }).dynamicDB.getRepository<BaseModel>(options.name);

        const data = await repo.find({
            advancedSearch: ctx.advancedSearch as AdvancedSearch<BaseModel>[],
            selectedFields: ctx.selectedFields as string[],
            limit: (ctx.pagination as { limit: number; offset: number }).limit,
            offset: (ctx.pagination as { limit: number; offset: number }).offset
        });
        return {
            message: `Found ${data.length} records for ${options.name}`,
            content: data
        };
    };

    const findOneUseCase = async (
        { dynamicDB, params }: { dynamicDB: MSSQL, params: typeof crudIdParamSchema.static }
    ): Promise<{ message: string; content: BaseModel; }> => {
        const repo = dynamicDB.getRepository<BaseModel>(options.name);
        const table = dynamicDB.getTable(options.name);
        const primary = table.primaryKey;

        const data = await repo.findOne({
            advancedSearch: {
                [primary[0]]: params.id
            } as AdvancedSearch<BaseModel>
        });
        return {
            message: `Found ${data.length} records for ${options.name}`,
            content: data
        };
    };

    if (options.database && typeof options.database === 'string')
        app
            .resolve({ as: 'local' }, () => ({
                dynamicDB: SingletonManager.get<MSSQL>(`database:${options.database as string}`)
            }))
            .get('/find', findUseCase, {
                query: buildBaseSearchSchemaWithPagination<TInferedObject>(baseSchema),
                hasAdvancedSearch: true,
                response: {
                    200: crudResponse200Schema
                }
            })
            .get('/findOne/:id', findOneUseCase, {
                params: crudIdParamSchema
            });
            // delete
            // deleteOne
            // update
            // updateOne
            // insert
            // count

            // ajout de deux parametre inclusion et exclusion pour les routes

    if (options.database && typeof options.database === 'object')
        app
            .use(dynamicDatabaseSelectorPlugin({
                baseDatabaseConfig: options.database.baseDatabaseConfig,
                headerKey: options.database.headerKey || 'database-using'
            }))
            .get('/find', findUseCase, {
                query: buildBaseSearchSchemaWithPagination<TInferedObject>(baseSchema),
                hasDynamicDatabaseSelector: true,
                hasAdvancedSearch: true
            })
            .get('/findOne/:id', findOneUseCase, {
                params: crudIdParamSchema,
                hasDynamicDatabaseSelector: true
            });
    return app;
};
import { CoreError } from '#/common/error/core.error.ts';
import { ErrorKeys } from '#/common/error/keys.error.ts';
import type { FastifyInstance, FastifyReply, FastifyRequest, FastifySchema, HTTPMethods, RouteOptions } from '#/common/lib/required/fastify/fastify.lib.ts';
import { S, type ObjectSchema } from '#/common/lib/required/fluent-json-schema/fluent.lib.ts';
import type { DynamicDatabaseOptions } from '#/common/type/data/infrastructure/dynamicDatabaseOptions.data.ts';
import { FactoryDatabase } from '#/infrastructure/database/factory.database.ts';
import { CrudHandler } from '#/presentation/http/handler/crud.handler.ts';
import { dynamicDatabaseRegister } from '#/presentation/http/middleware/dynamicDatabaseRegister.ts';
import { default200ResponseSchema } from '#/presentation/schema/defaultResponse.schema.ts';
import { AbstractRouter } from './abstract.router.ts';

/**
 * The operation configuration.
 */
export interface BaseOperationOptions {
    /**
     * The preHandler function for the operation.
     * Can be a function or an array of functions. ({@link FastifyRequest}, {@link FastifyReply})
     */
    preHandler: ((request: FastifyRequest, reply: FastifyReply) => void)
        | ((request: FastifyRequest, reply: FastifyReply, next: () => void) => void)
        | ((request: FastifyRequest, reply: FastifyReply) => void)[]
        | ((request: FastifyRequest, reply: FastifyReply, next: () => void) => void)[];
}

/**
 * The count operation configuration.
 */
export interface CountOperationOptions {
    searchSchema: ObjectSchema;
}

/**
 * The delete one operation configuration.
 */
export interface DeleteOneOperationOptions {
    outputSchema: ObjectSchema;
}

/**
 * The delete operation configuration.
 */
export interface DeleteOperationOptions {
    searchSchema: ObjectSchema;
    outputSchema: ObjectSchema;
}

/**
 * The find one operation configuration.
 */
export interface FindOneOperationOptions {
    outputSchema: ObjectSchema;
}

/**
 * The find operation configuration.
 */
export interface FindOperationOptions {
    searchSchema: ObjectSchema;
    outputSchema: ObjectSchema;
}

/**
 * The insert operation configuration.
 */
export interface InsertOperationOptions<T> {
    required: (keyof T)[];
    inputSchema: ObjectSchema;
    outputSchema: ObjectSchema;
}

/**
 * The update one operation configuration.
 */
export interface UpdateOneOperationOptions {
    inputSchema: ObjectSchema;
    outputSchema: ObjectSchema;
}

/**
 * The update operation configuration.
 */
export interface UpdateOperationOptions {
    searchSchema: ObjectSchema;
    inputSchema: ObjectSchema;
    outputSchema: ObjectSchema;
}

/**
 * Operations configuration.
 */
export interface OperationsOptions<T> {
    insert: Partial<BaseOperationOptions> & Partial<InsertOperationOptions<T>>;
    find: Partial<BaseOperationOptions> & Partial<FindOperationOptions>;
    findOne: Partial<BaseOperationOptions> & Partial<FindOneOperationOptions>;
    update: Partial<BaseOperationOptions> & Partial<UpdateOperationOptions>;
    updateOne: Partial<BaseOperationOptions> & Partial<UpdateOneOperationOptions>;
    delete: Partial<BaseOperationOptions> & Partial<DeleteOperationOptions>;
    deleteOne: Partial<BaseOperationOptions> & Partial<DeleteOneOperationOptions>;
    count: Partial<BaseOperationOptions> & Partial<CountOperationOptions>;
}

/**
 * Interface for Abstract CRUD configuration.
 *
 * @typeParam T - The type of the data.
 */
export interface AbstractCrudOptions<T> {
    /**
     * The table name.
     */
    table: string;

    /**
     * The tags for the CRUD routes.
     */
    tags?: string[];

    /**
     * The prefix for the CRUD routes.
     */
    prefix: string;

    /**
     * The operations configuration. ({@link OperationsOptions})
     */
    operations: Partial<OperationsOptions<T>>;

    /**
     * The database name.
     * Set undefined for dynamic database name based on the request header. (database-using)
     */
    databaseName?: string | undefined;

    /**
     * The dynamic database configuration if the database name is undefined.
     * Allow to create a dynamic database based on the request header in the factory database. ({@link DynamicDatabaseOptions})
     */
    dynamicDatabaseConfig?: DynamicDatabaseOptions | undefined;

    /**
     * The primary key for the table.
     * The first element is the key name and the second element is the key type.
     *
     * Undefined uses the default primary key. (id, NUMBER)
     *
     * @typeParam T - The type of the data. (Is the table model (interface to represent the table))
     *
     * @example
     *
     * primaryKey: ['uuid', 'STRING']
     */
    primaryKey?: [keyof T, 'NUMBER' | 'STRING'] | undefined;
}


/**
 * The abstract CRUD router.
 *
 * Inherit from the File class ({@link AbstractRouter}).
 *
 * @typeParam T - The type of the data. (Is the table model (interface to represent the table))
 */
export abstract class AbstractCrud<T> extends AbstractRouter {
    /**
     * The CRUD configuration. ({@link AbstractCrudOptions})
     */
    protected readonly _options: AbstractCrudOptions<T>;

    /**
     * Add custom routes to the router if needed.
     *
     * @param fastify - The Fastify instance. ({@link FastifyInstance})
     */
    protected _addRoutes: ((fastify: FastifyInstance) => void) | undefined;

    /**
     * The CRUD handler. ({@link CrudHandler})
     *
     * @typeParam T - The type of the data. (Is the table model (interface to represent the table))
     */
    private readonly _crudHandler: CrudHandler<T>;

    /**
     * The constructor for the abstract CRUD router. ({@link AbstractCrud})
     *
     * @param options - The CRUD configuration. ({@link AbstractCrudOptions})
     *
     * @typeParam T - The type of the data. (Is the table model (interface to represent the table))
     */
    protected constructor(options: AbstractCrudOptions<T>) {
        super(options.prefix);
        this._options = options;

        if (this._options.databaseName && !FactoryDatabase.has(this._options.databaseName))
            throw new CoreError({
                messageKey: ErrorKeys.DATABASE_NOT_REGISTERED,
                code: 500
            });

        this._crudHandler = new CrudHandler<T>({
            table: options.table,
            primaryKey: options.primaryKey
        });
    }

    /**
     * Build the CRUD routes options.
     *
     * @returns The CRUD routes options. Record of({@link RouteOptions})
     */
    // eslint-disable-next-line complexity
    private _buildRoutesOptionsByOptions(): Record<string, RouteOptions> {
        const primaryKey = (this._options.primaryKey && String(this._options.primaryKey[0])) ?? 'id';
        const byOne = `/:${primaryKey}`;
        const tags = this._options.tags ?? [this._options.table];

        return {
            insert: {
                method: 'POST',
                url: '/',
                handler: this._crudHandler.insert.bind(this._crudHandler),
                schema: {
                    tags,
                    summary: `${this._options.table} - Insert`,
                    description: `Insert a new ${this._options.table} or multiple ${this._options.table}`,
                    body: (this._options.operations.insert?.inputSchema ?? S.object())
                        .required(
                            this._options.operations.insert?.required
                                ? this._options.operations.insert.required as string[]
                                : []
                        ),
                    response: {
                        200:
                            default200ResponseSchema(
                                'handler.crud.insert',
                                undefined,
                                S.object()
                                    .prop('data', S.array().items(this._options.operations.insert?.outputSchema ?? S.object()))
                                    .prop('count', S.number())
                            )
                    }
                }
            },
            find: {
                method: 'GET',
                url: '/',
                handler: this._crudHandler.find.bind(this._crudHandler),
                schema: {
                    tags,
                    summary: `${this._options.table} - Find`,
                    description: `Find all ${this._options.table} or find ${this._options.table} by query`,
                    querystring: (this._options.operations.find?.searchSchema ?? S.object())
                        .prop('limit', S.string().pattern('^[0-9]+$'))
                        .prop('offset', S.string().pattern('^[0-9]+$')),
                    response: {
                        200:
                            default200ResponseSchema(
                                'handler.crud.find',
                                undefined,
                                S.object()
                                    .prop('data', S.array().items(this._options.operations.find?.outputSchema ?? S.object()))
                                    .prop('count', S.number())
                                    .prop('total', S.number())
                            )
                    }
                }
            },
            findOne: {
                method: 'GET',
                url: byOne,
                handler: this._crudHandler.findOne.bind(this._crudHandler),
                schema: {
                    tags,
                    summary: `${this._options.table} - Find One`,
                    description: `Find one ${this._options.table} by ${primaryKey}`,
                    params: S.object().prop(primaryKey, S.string().required()),
                    response: {
                        200:
                            default200ResponseSchema(
                                'handler.crud.findOne',
                                undefined,
                                S.object()
                                    .prop('data', this._options.operations.findOne?.outputSchema ?? S.object())
                            )
                    }
                }
            },
            update: {
                method: 'PATCH',
                url: '/',
                handler: this._crudHandler.update.bind(this._crudHandler),
                schema: {
                    tags,
                    summary: `${this._options.table} - Update`,
                    description: `Update all ${this._options.table} or multiple ${this._options.table} by query`,
                    querystring: this._options.operations.update?.searchSchema ?? S.object(),
                    body: this._options.operations.update?.inputSchema ?? S.object(),
                    response: {
                        200:
                            default200ResponseSchema(
                                'handler.crud.update',
                                undefined,
                                S.object()
                                    .prop('data', S.array().items(this._options.operations.update?.outputSchema ?? S.object()))
                                    .prop('count', S.number())
                            )
                    }
                }
            },
            updateOne: {
                method: 'PATCH',
                url: byOne,
                handler: this._crudHandler.updateOne.bind(this._crudHandler),
                schema: {
                    tags,
                    summary: `${this._options.table} - Update One`,
                    description: `Update one ${this._options.table} by ${primaryKey}`,
                    params: S.object().prop(primaryKey, S.string().required()),
                    body: this._options.operations.updateOne?.inputSchema ?? S.object(),
                    response: {
                        200:
                            default200ResponseSchema(
                                'handler.crud.updateOne',
                                undefined,
                                S.object()
                                    .prop('data', this._options.operations.updateOne?.outputSchema ?? S.object())
                                    .prop('count', S.number())
                            )
                    }
                }
            },
            delete: {
                method: 'DELETE',
                url: '/',
                handler: this._crudHandler.delete.bind(this._crudHandler),
                schema: {
                    tags,
                    summary: `${this._options.table} - Delete`,
                    description: `Delete all ${this._options.table} or multiple ${this._options.table} by query`,
                    querystring: this._options.operations.delete?.searchSchema ?? S.object(),
                    response: {
                        200:
                            default200ResponseSchema(
                                'handler.crud.delete',
                                undefined,
                                S.object()
                                    .prop('data', S.array().items(this._options.operations.delete?.outputSchema ?? S.object()))
                                    .prop('count', S.number())
                            )
                    }
                }
            },
            deleteOne: {
                method: 'DELETE',
                url: byOne,
                handler: this._crudHandler.deleteOne.bind(this._crudHandler),
                schema: {
                    tags,
                    summary: `${this._options.table} - Delete One`,
                    description: `Delete one ${this._options.table} by ${primaryKey}`,
                    params: S.object().prop(primaryKey, S.string().required()),
                    response: {
                        200:
                            default200ResponseSchema(
                                'handler.crud.deleteOne',
                                undefined,
                                S.object()
                                    .prop('data', this._options.operations.deleteOne?.outputSchema ?? S.object())
                            )
                    }
                }
            },
            count: {
                method: 'GET',
                url: '/count',
                handler: this._crudHandler.count.bind(this._crudHandler),
                schema: {
                    tags,
                    summary: `${this._options.table} - Count`,
                    description: `Count all ${this._options.table} or count ${this._options.table} by query`,
                    querystring: this._options.operations.count?.searchSchema ?? S.object(),
                    response: {
                        200:
                            default200ResponseSchema(
                                'handler.crud.count',
                                undefined,
                                S.object()
                                    .prop('count', S.number())
                            )
                    }
                }
            }
        };
    }

    /**
     * Initialize the operation selected by the user and the custom routes.
     *
     * @throws ({@link CoreError}) If the database name is not specified in the header. ({@link ErrorKeys.DATABASE_NOT_SPECIFIED_IN_HEADER})
     * @throws ({@link CoreError}) If the dynamic database configuration is not set. ({@link ErrorKeys.DYNAMIC_DATABASE_CONFIG_NOT_SET})
     *
     * @param fastify - The Fastify instance. ({@link FastifyInstance})
     */
    protected override _initRoutes(fastify: FastifyInstance): void {
        const operations: Record<string, RouteOptions> = this._buildRoutesOptionsByOptions();

        const preHandlerDynamicDatabase = this._options.databaseName
            ? (req: FastifyRequest, _: FastifyReply, next: () => void): void => {
                req.headers.databaseName = this._options.databaseName;
                next();
            }
            : dynamicDatabaseRegister(this._options.dynamicDatabaseConfig);

        Object.entries(this._options.operations).forEach(([operation, config]) => {
            if (config && operations[operation]) {
                const { method, url, handler, schema } = operations[operation];
                const preHandlerConfig = Array.isArray(config.preHandler) ? config.preHandler : [config.preHandler];
                const preHandlers = [preHandlerDynamicDatabase, ...preHandlerConfig].filter((handlerConf) => handlerConf !== undefined);

                fastify.route({
                    method: method as HTTPMethods,
                    url,
                    handler,
                    schema: schema as FastifySchema,
                    preHandler: preHandlers
                });
            }
        });

        if (this._addRoutes)
            this._addRoutes(fastify);
    }
}

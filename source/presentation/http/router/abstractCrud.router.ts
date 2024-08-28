import type { FastifyInstance, FastifyReply, FastifyRequest, HTTPMethods } from 'fastify';

import { CoreError } from '#/common/error/core.error.ts';
import { ErrorKeys } from '#/common/error/keys.error.ts';
import type { AbstractCrudOptions } from '#/common/types/index.ts';
import { CrudHandler } from '#/presentation/http/handler/index.ts';
import { AbstractRouter } from './abstract.router.ts';

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
    private readonly _options: AbstractCrudOptions<T>;

    /**
     * The CRUD handler. ({@link CrudHandler})
     *
     * @typeParam T - The type of the data. (Is the table model (interface to represent the table))
     */
    private readonly _crudHandler: CrudHandler<T>;

    /**
     * Add custom routes to the router if needed.
     *
     * @param fastify - The Fastify instance. ({@link FastifyInstance})
     */
    protected _addRoutes: ((fastify: FastifyInstance) => void) | undefined;

    /**
     * The constructor for the abstract CRUD router. ({@link AbstractCrud})
     *
     * @param options - The CRUD configuration. ({@link AbstractCrudOptions})
     *
     * @throws ({@link CoreError}) - If the database name or dynamic database configuration is not set. ({@link ErrorKeys.SET_DATABASE_NAME_OR_DYNAMIC_DATABASE_CONFIG})
     *
     * @typeParam T - The type of the data. (Is the table model (interface to represent the table))
     */
    protected constructor(options: AbstractCrudOptions<T>) {
        super(options.prefix);
        this._options = options;

        if (!options.databaseName && !options.dynamicDatabaseConfig)
            throw new CoreError({
                messageKey: ErrorKeys.SET_DATABASE_NAME_OR_DYNAMIC_DATABASE_CONFIG
            });

        this._crudHandler = new CrudHandler<T>({
            keyInclusion: options.keyInclusion,
            table: options.table,
            databaseName: options.databaseName,
            dynamicDatabaseConfig: options.dynamicDatabaseConfig,
            primaryKey: options.primaryKey
        });
    }

    /**
     * Initialize the operation selected by the user and the custom routes.
     *
     * @param fastify - The Fastify instance. ({@link FastifyInstance})
     */
    protected override _initRoutes(fastify: FastifyInstance): void {
        const primaryKey = (this._options.primaryKey && String(this._options.primaryKey[0])) ?? 'id';
        const byOne = `/:${primaryKey}`;

        const operations: Record<string, { method: string, url: string, handler: (req: FastifyRequest, reply: FastifyReply) => Promise<void> }> = {
            insert: { method: 'POST', url: '/', handler: this._crudHandler.insert.bind(this._crudHandler) },
            find: { method: 'GET', url: '/', handler: this._crudHandler.find.bind(this._crudHandler) },
            findOne: { method: 'GET', url: byOne, handler: this._crudHandler.findOne.bind(this._crudHandler) },
            update: { method: 'PATCH', url: '/', handler: this._crudHandler.update.bind(this._crudHandler) },
            updateOne: { method: 'PATCH', url: byOne, handler: this._crudHandler.updateOne.bind(this._crudHandler) },
            delete: { method: 'DELETE', url: '/', handler: this._crudHandler.delete.bind(this._crudHandler) },
            deleteOne: { method: 'DELETE', url: byOne, handler: this._crudHandler.deleteOne.bind(this._crudHandler) },
            count: { method: 'GET', url: '/count', handler: this._crudHandler.count.bind(this._crudHandler) },
        };

        Object.entries(this._options.operations).forEach(([operation, config]) => {
            if (config && operations[operation]) {
                const { method, url, handler } = operations[operation];
                fastify.route({
                    method: method as HTTPMethods,
                    url,
                    handler,
                    ...(config.schema && { schema: config.schema }),
                    ...(config.preHandler && { preHandler: config.preHandler }),
                });
            }
        });
        if (this._addRoutes)
            this._addRoutes(fastify);
    }
}

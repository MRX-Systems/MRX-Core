import type { FastifyReply, FastifyRequest } from 'fastify';

import type { OptionalModel, SearchModel } from '#/common/types/index.ts';
import { crud } from '#/domain/usecase/index.ts';
import { extractQueryAndPagination, prepareSearchModel, sendResponse } from '#/presentation/http/util/index.ts';

export interface CrudHandlerOptions<T> {
    /**
     * The table name.
     */
    table: string;
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
 * The CRUD handler.
 *
 * @typeParam T - The type of the data. (Is the table model (interface to represent the table))
 */
export class CrudHandler<T> {
    /**
     * Options for the CRUD handler. ({@link CrudHandlerOptions})
     */
    private readonly _options: CrudHandlerOptions<T>;

    /**
     * The constructor for the CRUD handler class. ({@link CrudHandler})
     *
     * @param options - The options for the CRUD handler. ({@link CrudHandlerOptions})
     */
    public constructor(options: CrudHandlerOptions<T>) {
        this._options = options;
    }

    /**
     * Insert data into the table.
     *
     * @param req - The Fastify request. ({@link FastifyRequest})
     * @param reply - The Fastify reply. ({@link FastifyReply})
     */
    public async insert(req: FastifyRequest, reply: FastifyReply): Promise<void> {
        const databaseName = req.headers.databaseName as string;
        const body: T[] = Array.isArray(req.body) ? req.body as T[] : [req.body as T];
        const data = await crud.insert<T>(body, this._options.table, databaseName, this._options.primaryKey) as OptionalModel<T>[];
        await sendResponse(req, reply, {
            messageKey: 'handler.crud.insert',
            statusCode: 201,
            content: {
                table: this._options.table,
                databaseName,
                data,
                count: data.length
            }
        });
    }

    /**
     * Find data in the table. (With pagination and advanced search)
     *
     * @param req - The Fastify request. ({@link FastifyRequest})
     * @param reply - The Fastify reply. ({@link FastifyReply})
     */
    public async find(req: FastifyRequest, reply: FastifyReply): Promise<void> {
        const databaseName = req.headers.databaseName as string;
        const { query, pagination } = extractQueryAndPagination(req);
        pagination.limit ??= 100;
        pagination.offset ??= 0;
        const search = prepareSearchModel<T>(query);
        const data = await crud.find<T>(search, pagination, this._options.table, databaseName, this._options.primaryKey) as OptionalModel<T>[];
        const total = await crud.count<T>(search, this._options.table, databaseName, this._options.primaryKey) as number;
        await sendResponse(req, reply, {
            messageKey: 'handler.crud.find',
            statusCode: 200,
            content: {
                table: this._options.table,
                databaseName,
                data,
                count: data.length,
                total
            }
        });
    }

    /**
     * Find one data in the table.
     *
     * @param req - The Fastify request. ({@link FastifyRequest})
     * @param reply - The Fastify reply. ({@link FastifyReply})
     */
    public async findOne(req: FastifyRequest, reply: FastifyReply): Promise<void> {
        const databaseName = req.headers.databaseName as string;
        const key = this._options.primaryKey?.[0] ?? 'id';
        const value = (req.params as Record<string, unknown>)[key as string] as string;
        const search: SearchModel<T> = {
            [key]: value
        } as SearchModel<T>;
        const data = await crud.findOne<T>(search, this._options.table, databaseName, this._options.primaryKey) as OptionalModel<T>;
        await sendResponse(req, reply, {
            messageKey: 'handler.crud.findOne',
            statusCode: 200,
            content: {
                table: this._options.table,
                databaseName,
                data
            }
        });
    }

    /**
     * Update data in the table. (With advanced search)
     *
     * @param req - The Fastify request. ({@link FastifyRequest})
     * @param reply - The Fastify reply. ({@link FastifyReply})
     */
    public async update(req: FastifyRequest, reply: FastifyReply): Promise<void> {
        const databaseName = req.headers.databaseName as string;
        const body: Partial<T> = req.body as Partial<T>;
        const search = prepareSearchModel<T>(req.query as Record<string, unknown>);
        const data = await crud.update<T>(body, search, this._options.table, databaseName, this._options.primaryKey) as OptionalModel<T>[];
        await sendResponse(req, reply, {
            messageKey: 'handler.crud.update',
            statusCode: 200,
            content: {
                table: this._options.table,
                databaseName,
                data,
                count: data.length
            }
        });
    }

    /**
     * Update one data in the table.
     *
     * @param req - The Fastify request. ({@link FastifyRequest})
     * @param reply - The Fastify reply. ({@link FastifyReply})
     */
    public async updateOne(req: FastifyRequest, reply: FastifyReply): Promise<void> {
        const databaseName = req.headers.databaseName as string;
        const key = this._options.primaryKey?.[0] ?? 'id';
        const value = (req.params as Record<string, unknown>)[key as string] as string;
        const body: Partial<T> = req.body as Partial<T>;
        const search: SearchModel<T> = {
            [key]: value
        } as SearchModel<T>;
        const [data] = await crud.update(body, search, this._options.table, databaseName, this._options.primaryKey) as OptionalModel<T>[];
        await sendResponse(req, reply, {
            messageKey: 'handler.crud.updateOne',
            statusCode: 200,
            content: {
                table: this._options.table,
                databaseName,
                data
            }
        });
    }

    /**
     * Delete data in the table. (With advanced search)
     *
     * @param req - The Fastify request. ({@link FastifyRequest})
     * @param reply - The Fastify reply. ({@link FastifyReply})
     */
    public async delete(req: FastifyRequest, reply: FastifyReply): Promise<void> {
        const databaseName = req.headers.databaseName as string;
        const search = prepareSearchModel<T>(req.query as Record<string, unknown>);
        const data = await crud.del<T>(search, this._options.table, databaseName, this._options.primaryKey) as OptionalModel<T>[];
        await sendResponse(req, reply, {
            messageKey: 'handler.crud.delete',
            statusCode: 200,
            content: {
                table: this._options.table,
                databaseName,
                data,
                count: data.length
            }
        });
    }

    /**
     * Delete one data in the table.
     *
     * @param req - The Fastify request. ({@link FastifyRequest})
     * @param reply - The Fastify reply. ({@link FastifyReply})
     */
    public async deleteOne(req: FastifyRequest, reply: FastifyReply): Promise<void> {
        const databaseName = req.headers.databaseName as string;
        const key = this._options.primaryKey?.[0] ?? 'id';
        const value = (req.params as Record<string, unknown>)[key as string] as string;
        const search: SearchModel<T> = {
            [key]: value
        } as SearchModel<T>;
        const [data] = await crud.del(search, this._options.table, databaseName, this._options.primaryKey) as OptionalModel<T>[];
        await sendResponse(req, reply, {
            messageKey: 'handler.crud.deleteOne',
            statusCode: 200,
            content: {
                table: this._options.table,
                databaseName,
                data
            }
        });
    }

    /**
     * Count the data in the table. (With advanced search)
     *
     * @param req - The Fastify request. ({@link FastifyRequest})
     * @param reply - The Fastify reply. ({@link FastifyReply})
     */
    public async count(req: FastifyRequest, reply: FastifyReply): Promise<void> {
        const databaseName = req.headers.databaseName as string;
        const query = req.query as Record<string, unknown>;
        const search = prepareSearchModel<T>(query);
        const count = await crud.count<T>(search, this._options.table, databaseName, this._options.primaryKey) as number;
        await sendResponse(req, reply, {
            messageKey: 'handler.crud.count',
            statusCode: 200,
            content: {
                table: this._options.table,
                databaseName,
                count
            }
        });
    }
}

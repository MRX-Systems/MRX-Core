import { filterByKeyInclusion } from '@basalt-lab/basalt-helper';
import type { FastifyReply, FastifyRequest } from 'fastify';

import type { CrudHandlerOptions, PaginationQueryOptions, SearchModel } from '#/common/types/index.js';
import { I18n, isJsonString } from '#/common/util/index.js';
import { crud } from '#/domain/usecase/index.js';

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
        const body: T[] = Array.isArray(req.body) ? req.body : [req.body];
        const data = await crud.insert<T>(body, this._options.table, databaseName, this._options.primaryKey) as Partial<T>[];
        await this._sendResponse(req, reply, 200, 'handler.crud.insert', { data, count: data.length });
    }

    /**
     * Find data in the table. (With pagination and advanced search)
     *
     * @param req - The Fastify request. ({@link FastifyRequest})
     * @param reply - The Fastify reply. ({@link FastifyReply})
     */
    public async find(req: FastifyRequest, reply: FastifyReply): Promise<void> {
        const databaseName = req.headers.databaseName as string;
        const { query, pagination } = this._extractQueryAndPagination(req);
        const search = this._prepareSearchModel<T>(query);
        const data = await crud.find<T>(search, pagination, this._options.table, databaseName, this._options.primaryKey) as Partial<T>[];
        const total = await crud.count<T>(undefined, this._options.table, databaseName, this._options.primaryKey) as number;
        await this._sendResponse(req, reply, 200, 'handler.crud.find', { data, count: data.length, total });
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
        const search: Partial<T> = {
            [key]: value
        } as Partial<T>;
        const data = await crud.findOne<T>(search, this._options.table, databaseName, this._options.primaryKey) as Partial<T>;
        await this._sendResponse(req, reply, 200, 'handler.crud.findOne', { data });
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
        const search = this._prepareSearchModel<T>(req.query as Record<string, unknown>);
        const data = await crud.update<T>(body, search, this._options.table, databaseName, this._options.primaryKey) as Partial<T>[];
        await this._sendResponse(req, reply, 200, 'handler.crud.update', { data, count: data.length });
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
        const search: Partial<T> = {
            [key]: value
        } as Partial<T>;
        const [data] = await crud.update(body, search, this._options.table, databaseName, this._options.primaryKey) as Partial<T>[];
        await this._sendResponse(req, reply, 200, 'handler.crud.updateOne', { data });
    }

    /**
     * Delete data in the table. (With advanced search)
     *
     * @param req - The Fastify request. ({@link FastifyRequest})
     * @param reply - The Fastify reply. ({@link FastifyReply})
     */
    public async delete(req: FastifyRequest, reply: FastifyReply): Promise<void> {
        const databaseName = req.headers.databaseName as string;
        const search = this._prepareSearchModel<T>(req.query as Record<string, unknown>);
        const data = await crud.del<T>(search, this._options.table, databaseName, this._options.primaryKey) as Partial<T>[];
        await this._sendResponse(req, reply, 200, 'handler.crud.delete', { data, count: data.length });
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
        const search: Partial<T> = {
            [key]: value
        } as Partial<T>;
        const [data] = await crud.del(search, this._options.table, databaseName, this._options.primaryKey) as Partial<T>[];
        await this._sendResponse(req, reply, 200, 'handler.crud.deleteOne', { data });
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
        const search = this._prepareSearchModel<T>(query);
        const count = await crud.count<T>(search, this._options.table, databaseName, this._options.primaryKey) as number;
        await this._sendResponse(req, reply, 200, 'handler.crud.count', { count });
    }

    /**
     * Create an array of search models.
     *
     * @param data - The data to be converted to search models.
     *
     * @returns The array of search models. ({@link SearchModel})
     */
    private _prepareSearchModel<T>(data: Record<string, unknown>): SearchModel<T>[] {
        return Object.entries(data).flatMap(([key, value]) =>
            Array.isArray(value)
                ? value.map(v => this._createSearchEntry(key, v))
                : this._createSearchEntry(key, value)
        );
    }

    /**
     * Create a search model.
     *
     * @param key - The key of the search model.
     * @param value - The value of the search model.
     *
     * @returns The search model. ({@link SearchModel})
     */
    private _createSearchEntry<T>(key: string, value: unknown): SearchModel<T> {
        return { [key]: isJsonString(value as string) ? JSON.parse(value as string) : value } as SearchModel<T>;
    }

    /**
     * Extract the query and pagination from the request.
     *
     * @param req - The Fastify request. ({@link FastifyRequest})
     *
     * @returns The query and pagination. ({@link PaginationQueryOptions})
     */
    private _extractQueryAndPagination(req: FastifyRequest): { query: Record<string, unknown>, pagination: PaginationQueryOptions } {
        const pagination = filterByKeyInclusion<PaginationQueryOptions>(req.query as PaginationQueryOptions, ['limit', 'offset'], true);
        const query = filterByKeyInclusion<Partial<T>>(req.query as Partial<T>, this._options.keyInclusion, true);
        return { query, pagination };
    }

    /**
     * Send the response to the client.
     *
     * @param req - The Fastify request. ({@link FastifyRequest})
     * @param reply - The Fastify reply. ({@link FastifyReply})
     * @param statusCode - The status code.
     * @param messageKey - The message key.
     * @param content - The content to be sent.
     */
    private async _sendResponse(
        req: FastifyRequest,
        reply: FastifyReply,
        statusCode: number,
        messageKey: string,
        content: Record<string, unknown>
    ): Promise<void> {
        const isI18nInitialized = I18n.isI18nInitialized();
        const message = isI18nInitialized
            ? I18n.translate(messageKey, req.headers['accept-language'], {
                ...content,
                table: this._options.table,
                database: req.headers.databaseName
            })
            : messageKey;
        await reply.send({
            statusCode,
            message,
            content
        });
    }
}

import type { FastifyReply, FastifyRequest } from 'fastify';
import { filterByKeyInclusion, filterByKeyExclusion } from '@basalt-lab/basalt-helper';

import type { PaginationQueryOptions, SearchModel } from '#/common/types/index.ts';
import { I18n, isJsonString } from '#/common/util/index.js';

/**
 * Create a search model.
 *
 * @param key - The key of the search model.
 * @param value - The value of the search model.
 *
 * @returns The search model. ({@link SearchModel})
 */
export function createSearchEntry<T>(key: string, value: unknown): SearchModel<T> {
    return { [key]: isJsonString(value as string) ? JSON.parse(value as string) : value } as SearchModel<T>;
}


/**
 * Create an array of search models.
 *
 * @param data - The data to be converted to search models.
 *
 * @returns The array of search models. ({@link SearchModel}[])
 */
export function prepareSearchModel<T>(data: Record<string, unknown>): SearchModel<T>[] {
    return Object.entries(data).flatMap(([key, value]) =>
        Array.isArray(value)
            ? value.map(v => createSearchEntry(key, v))
            : [createSearchEntry(key, value)]
    );
}

/**
 * Extract the query and pagination from the request.
 *
 * @param req - The Fastify request. ({@link FastifyRequest})
 *
 * @returns The query and pagination. ({@link PaginationQueryOptions})
 */
export function extractQueryAndPagination(req: FastifyRequest): { query: Record<string, unknown>, pagination: PaginationQueryOptions } {
    const pagination = filterByKeyInclusion(req.query as PaginationQueryOptions, ['limit', 'offset'], true);
    const query = filterByKeyExclusion(req.query as Record<string, unknown>, ['limit', 'offset'], true);
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
export async function sendResponse(
    req: FastifyRequest,
    reply: FastifyReply,
    options: {
        statusCode: number,
        messageKey: string,
        content: Record<string, unknown>
}): Promise<void> {
    const isI18nInitialized = I18n.isI18nInitialized();
    const message = isI18nInitialized
        ? I18n.translate(options.messageKey, req.headers['accept-language'], options.content)
        : options.messageKey;
    await reply.send({
        statusCode: options.statusCode,
        message,
        content: options.content
    });
}
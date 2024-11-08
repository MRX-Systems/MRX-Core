import { filterByKeyExclusion, filterByKeyInclusion } from '@basalt-lab/basalt-helper';
import type { FastifyReply, FastifyRequest } from 'fastify';

import type { SearchModel } from '#/common/types/index.ts';
import { I18n } from '#/common/util/index.ts';
import type { PaginationQueryOptions } from '#/infrastructure/repository/index.ts';

/**
 * Create an array of search models.
 *
 * @param data - The data to be converted to search models.
 *
 * @returns The array of search models. ({@link SearchModel}[])
 */
export function prepareSearchModel<T>(data: Partial<Record<string, unknown>> | Partial<Record<keyof T, unknown>>): SearchModel<T>[] {
    const resultArray: SearchModel<T>[] = [];

    Object.entries(data).forEach(([key, value]) => {
        if (Array.isArray(value))
            value.forEach((v, index) => {
                // Ensure resultArray has an object for each array element position
                if (!resultArray[index])
                    resultArray[index] = {};

                // Overwrite just the array key for each specific array item
                resultArray[index][key as keyof T] = v;
            });
        else
            // If it's a simple value, add it to each result object (or start a single object)
            if (resultArray.length === 0)
                resultArray.push({ [key]: value } as SearchModel<T>);
            else
                resultArray.forEach((obj) => {
                    (obj as Record<string, unknown>)[key] = value;
                });
    });

    return resultArray;
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
        content?: Record<string, unknown>
    }
): Promise<void> {
    const isI18nInitialized = I18n.isI18nInitialized();
    const message = isI18nInitialized
        ? I18n.translate(options.messageKey, req.headers['accept-language'], options.content)
        : options.messageKey;
    await reply.send({
        statusCode: options.statusCode,
        message,
        ...(options.content && { content: options.content })
    });
}

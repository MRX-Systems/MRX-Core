import type { FastifyInstance, FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';

import type { Hook } from '#/common/types/index.ts';

/**
 * Query Parse Hook class implement the Hook interface ({@link Hook})
 *
 * This hook is responsible for parsing the query string to JSON.
 */
export class QueryParseHook implements Hook {

    /**
     * Configure the hook
     *
     * @param app - The Fastify instance. ({@link FastifyInstance})
     */
    public configure(app: FastifyInstance): void {
        app.addHook('preValidation', (req: FastifyRequest, _: FastifyReply, done: HookHandlerDoneFunction) => {
            const query: Record<string, unknown> = req.query as Record<string, unknown>;
            for (const key in query)
                if (typeof query[key] === 'string' && query[key].startsWith('{'))
                    try {
                        query[key] = JSON.parse(query[key]);
                    } catch {
                        continue;
                    }
                else if (Array.isArray(query[key]))
                    query[key] = (query[key] as unknown[]).map((element: unknown): unknown => {
                        if (typeof element === 'string' && element.startsWith('{'))
                            try {
                                return JSON.parse(element);
                            } catch {
                                return element;
                            }
                        return element;
                    });
            done();
        });
    }
}

import type { FastifyInstance, FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';

import type { Hook } from '#/common/types/index.ts';

/**
 * Language Hook class implement the Hook interface ({@link Hook})
 *
 * This hook is responsible for parsing the language from the request headers.
 */
export class LanguageHook implements Hook {
    /**
     * Configure the hook
     *
     * @param app - The Fastify instance. ({@link FastifyInstance})
     */
    public configure(app: FastifyInstance): void {
        app.addHook('preHandler', (request: FastifyRequest, _: FastifyReply, done: HookHandlerDoneFunction) => {
            const acceptLanguage = request.headers['accept-language'];
            if (acceptLanguage) {
                const [language] = acceptLanguage.split(',');
                request.headers['accept-language'] = language;
            }
            done();
        });
    }
}

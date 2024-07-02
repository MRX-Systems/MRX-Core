import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import type { IHook } from '@/Presentation/HTTP/Interface/index.js';

/**
 * Language Hook class implement the IHook interface ({@link IHook})
 */
export class LanguageHook implements IHook {

    /**
     * Configure the hook
     *
     * @param app - The Fastify instance. ({@link FastifyInstance})
     */
    public configure(app: FastifyInstance): void {
        app.addHook('preHandler', (request: FastifyRequest, _: FastifyReply, done: () => void) => {
            const acceptLanguage = request.headers['accept-language'];
            if (acceptLanguage) {
                const [language] = acceptLanguage.split(',');
                request.headers['accept-language'] = language;
            }
            done();
        });
    }
}    
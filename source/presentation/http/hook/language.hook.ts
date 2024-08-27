import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import type { Hook } from '@/common/types';

/**
 * Language Hook class implement the IHook interface ({@link Hook})
 */
export class LanguageHook implements Hook {

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

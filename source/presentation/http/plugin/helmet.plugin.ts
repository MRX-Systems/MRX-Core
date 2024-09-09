import helmet from '@fastify/helmet';
import type { FastifyInstance } from 'fastify';

import type { Plugin } from '#/common/types/index.js';

/**
 * The HelmetPlugin plugin implement the IPlugin interface ({@link Plugin})
 */
export class HelmetPlugin implements Plugin {
    /**
     * Configures the HelmetPlugin.
     *
     * @param app - The Fastify instance. ({@link FastifyInstance})
     */
    public async configure(app: FastifyInstance): Promise<void> {
        await app.register(helmet);
    }
}

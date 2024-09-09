import type { FastifyInstance } from 'fastify';
import fastifyPrintRoutes from 'fastify-print-routes';

import type { Plugin } from '#/common/types/index.js';

/**
 * The cors plugin implement the IPlugin interface ({@link Plugin})
 */
export class PrintRoutePlugin implements Plugin {
    /**
     * Configures the print route plugin.
     *
     * @param app - The Fastify instance. ({@link FastifyInstance})
     */
    public async configure(app: FastifyInstance): Promise<void> {
        await app.register(fastifyPrintRoutes);
    }
}

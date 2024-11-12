import fastifyPrintRoutes from 'fastify-print-routes';

import type { FastifyInstance } from '#/common/lib/required/fastify/fastify.lib.ts';
import type { Plugin } from '#/common/type/data/presentation/http/plugin.data.ts';

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

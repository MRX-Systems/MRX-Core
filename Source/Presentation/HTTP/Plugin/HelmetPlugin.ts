import helmet from '@fastify/helmet';
import type { FastifyInstance } from 'fastify';

import type { IPlugin } from '@/Presentation/HTTP/Interface';

/**
 * The HelmetPlugin plugin.
 */
export class HelmetPlugin implements IPlugin {
    /**
     * Configures the HelmetPlugin.
     *
     * @param app - The Fastify instance.
     */
    public async configure(app: FastifyInstance): Promise<void> {
        await app.register(helmet);
    }
}

import cors from '@fastify/cors';
import type { FastifyInstance } from 'fastify';

import type { Plugin, CorsOptions } from '#/common/types/index.js';

/**
 * The cors plugin implement the IPlugin interface ({@link Plugin})
 */
export class CorsPlugin implements Plugin {
    /**
     * The options for the CORS. ({@link CorsOptions})
     */
    private readonly _options: CorsOptions | undefined;

    /**
     * Constructor of the CorsPlugin.
     *
     * @param options - The options for the CORS. ({@link CorsOptions})
     */
    public constructor(options?: CorsOptions) {
        this._options = options;
    }

    /**
     * Configures the CORS.
     *
     * @param app - The Fastify instance. ({@link FastifyInstance})
     */
    public async configure(app: FastifyInstance): Promise<void> {
        await app.register(cors, {
            origin: this._options?.origins ?? '*',
            methods: this._options?.methods ?? ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: this._options?.credentials ?? false
        });
    }
}

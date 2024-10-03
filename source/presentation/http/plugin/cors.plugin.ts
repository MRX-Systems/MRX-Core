import cors from '@fastify/cors';
import type { FastifyInstance } from 'fastify';

import type { Plugin } from '#/common/types/index.ts';

/**
 * The options for the CORS.
 */
export interface CorsOptions {
    /**
     * The origins for the CORS.
     */
    origins: string | string[];

    /**
     * Configures the Access-Control-Allow-Methods CORS header.
     * Expects a comma-delimited string (ex: 'GET,PUT,POST') or an array (ex: ['GET', 'PUT', 'POST']).
     */
    methods?: string | string[];

    /**
     * Credentials flag for the CORS.
     * Set to true to pass the header, otherwise it is omitted.
     */
    credentials?: boolean;
}

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

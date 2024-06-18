import cors from '@fastify/cors';
import type { FastifyInstance } from 'fastify';

import type { IPlugin } from '@/Presentation/HTTP/Interface';

/**
 * The options for the CORS.
 */
export interface ICorsOptions {
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
 * The cors plugin implement the IPlugin interface ({@link IPlugin})
 */
export class CorsPlugin implements IPlugin {
    /**
     * The options for the CORS. ({@link ICorsOptions})
     */
    private readonly _options: ICorsOptions | undefined;

    /**
     * Constructor of the CorsPlugin.
     *
     * @param options - The options for the CORS. ({@link ICorsOptions})
     */
    public constructor(options?: ICorsOptions) {
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

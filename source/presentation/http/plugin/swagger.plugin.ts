import fastifySwagger, { type SwaggerOptions } from '@fastify/swagger';
import type { FastifyInstance, FastifyRegisterOptions } from 'fastify';

import type { Plugin } from '#/common/types/index.js';

/**
 * The Swagger plugin implement the IPlugin interface ({@link Plugin})
 */
export class SwaggerPlugin implements Plugin {
    /**
     * The options for the Swagger.
     */
    private readonly _options: FastifyRegisterOptions<SwaggerOptions>;

    /**
     * Constructor of the SwaggerPlugin.
     *
     * @param options - The options for the Swagger. ({@link FastifyRegisterOptions}) ({@link SwaggerOptions})
     */
    public constructor(options: FastifyRegisterOptions<SwaggerOptions>) {
        this._options = options;
    }

    /**
     * Configures the Swagger.
     *
     * @param app - The Fastify instance. ({@link FastifyInstance})
     * @param baseUrl - The base URL of the Swagger.
     */
    public async configure(app: FastifyInstance, baseUrl: string): Promise<void> {
        await app.register(fastifySwagger, { ...this._options, prefix: baseUrl });
    }
}

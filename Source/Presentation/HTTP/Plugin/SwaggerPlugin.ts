import fastifySwagger, { type SwaggerOptions } from '@fastify/swagger';
import type { FastifyInstance, FastifyRegisterOptions } from 'fastify';

import type { IPlugin } from '@/Presentation/HTTP/Interface';


/**
 * The Swagger plugin.
 */
export class SwaggerPlugin implements IPlugin {
    /**
     * The options for the Swagger.
     */
    private readonly _options: FastifyRegisterOptions<SwaggerOptions>;

    /**
     * Constructor of the SwaggerPlugin.
     *
     * @param options - The options for the Swagger.
     */
    public constructor(options: FastifyRegisterOptions<SwaggerOptions>) {
        this._options = options;
    }

    /**
     * Configures the Swagger.
     *
     * @param app - The Fastify instance.
     */
    public async configure(app: FastifyInstance): Promise<void> {
        await app.register(fastifySwagger, this._options);
    }
}

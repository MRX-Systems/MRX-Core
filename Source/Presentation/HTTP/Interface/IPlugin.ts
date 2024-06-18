import type { FastifyInstance } from 'fastify';

/**
 * The interface for implementing a plugin.
 */
export interface IPlugin {
    /**
     * Configures the plugin.
     *
     * @param app - The Fastify instance. ({@link FastifyInstance})
     * @param baseUrl - The base URL of the SwaggerScalarUi.
     */
    configure(app: FastifyInstance, baseUrl: string): Promise<void> | void;
}

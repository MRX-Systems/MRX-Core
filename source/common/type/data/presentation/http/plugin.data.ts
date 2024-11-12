import type { FastifyInstance } from '#/common/lib/required/fastify/fastify.lib.ts';

/**
 * The interface for implementing a plugin.
 */
export interface Plugin {
    /**
     * Configures the plugin.
     *
     * @param app - The Fastify instance. ({@link FastifyInstance})
     * @param baseUrl - The base URL of the SwaggerScalarUi.
     */
    configure(app: FastifyInstance, baseUrl: string): Promise<void> | void;
}

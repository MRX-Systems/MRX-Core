import type { FastifyInstance } from 'fastify';

/**
 * The interface for implementing a plugin.
 */
export interface IPlugin {
    /**
     * Configures the plugin.
     * 
     * @param app - The Fastify instance.
     * @param options - The options for the plugin.
     */
    configure(app: FastifyInstance, options?: unknown): Promise<void> | void;
}

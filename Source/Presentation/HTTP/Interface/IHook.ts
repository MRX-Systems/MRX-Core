import type { FastifyInstance } from 'fastify';

/**
 * The interface for implementing a hook.
 */
export interface IHook {
    /**
     * Configures the hook.
     *
     * @param app - The Fastify instance. ({@link FastifyInstance})
     */
    configure(app: FastifyInstance): void | Promise<void>;
}

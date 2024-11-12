import type { FastifyInstance } from '#/common/lib/required/fastify/fastify.lib.ts';

/**
 * The interface for implementing a hook.
 */
export interface Hook {
    /**
     * Configures the hook.
     *
     * @param app - The Fastify instance. ({@link FastifyInstance})
     */
    configure(app: FastifyInstance): void | Promise<void>;
}

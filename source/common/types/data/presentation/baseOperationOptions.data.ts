import type { FastifyReply, FastifyRequest } from 'fastify';

/**
 * The operation configuration.
 */
export interface BaseOperationOptions {
    /**
     * The preHandler function for the operation.
     * Can be a function or an array of functions. ({@link FastifyRequest}, {@link FastifyReply})
     */
    preHandler: ((request: FastifyRequest, reply: FastifyReply) => void)
        | ((request: FastifyRequest, reply: FastifyReply, next: () => void) => void)
        | ((request: FastifyRequest, reply: FastifyReply) => void)[]
        | ((request: FastifyRequest, reply: FastifyReply, next: () => void) => void)[];
}

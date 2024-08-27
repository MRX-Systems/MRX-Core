import type { FastifyReply, FastifyRequest, FastifySchema } from 'fastify';

/**
 * The operation configuration.
 */
export interface OperationOptions {
    /**
     * The schema for the operation. ({@link FastifySchema})
     */
    schema: FastifySchema;

    /**
     * The preHandler function for the operation.
     * Can be a function or an array of functions.
     */
    preHandler: (request: FastifyRequest, reply: FastifyReply) => void | ((request: FastifyRequest, reply: FastifyReply) => void)[];
}

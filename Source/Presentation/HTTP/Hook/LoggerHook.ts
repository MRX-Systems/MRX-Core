import { BasaltLogger } from '@basalt-lab/basalt-logger';
import type { FastifyReply, FastifyRequest } from 'fastify';

/**
 * The logger hook function.
 * 
 * @param request - The request object.
 * @param reply - The reply object.
 */
function loggerHook(request: FastifyRequest, reply: FastifyReply): void {
    BasaltLogger.info({
        requestId: request.id,
        hostname: request.hostname,
        ip: request.ip,
        ips: request.ips,
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        createdAt: new Date(),
    });
}

export {
    loggerHook
};

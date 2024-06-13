import { BasaltLogger } from '@basalt-lab/basalt-logger';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import type { IHook } from '@/Presentation/HTTP/Interface';

export class LoggerHook implements IHook {
    public configure(app: FastifyInstance): void {
        app.addHook('onSend', (request: FastifyRequest, reply: FastifyReply, payload, done) => {
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
            done(null, payload);
        });
    }

}

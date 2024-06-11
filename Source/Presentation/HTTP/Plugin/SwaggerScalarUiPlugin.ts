
import type { FastifyInstance } from 'fastify';

import type { IPlugin } from '@/Presentation/HTTP/Interface';


/**
 * The SwaggerScalarUi plugin.
 */
export class SwaggerScalarUiPlugin implements IPlugin {
    /**
     * Configures the SwaggerScalarUi.
     * 
     * @param app - The Fastify instance.
     */
    public async configure(app: FastifyInstance): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
        await app.register(require('@scalar/fastify-api-reference'), {
            routePrefix: '/swagger',
            configuration: {
                theme: 'purple'
            }
        });
    }
}
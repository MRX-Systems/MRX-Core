import type { FastifyInstance, FastifyPluginAsync } from '#/common/lib/required/fastify/fastify.lib.ts';

/**
 * AbstractRouter class is responsible for defining the structure of the routers.
 */
export abstract class AbstractRouter {
    /**
     * The prefix of the router.
     */
    private readonly _routerPrefix: string;

    /**
     * Constructor of the AbstractRouter class.
     *
     * @param prefix - The prefix of the router.
     */
    public constructor(prefix: string) {
        this._routerPrefix = prefix;
    }

    /**
     * Configure the router.
     *
     * @param app - The Fastify instance. ({@link FastifyInstance})
     * @param baseUrl - The base URL of the router.
     */
    public async configure(app: FastifyInstance, baseUrl: string): Promise<void> {
        let sanitizedBaseUrl = baseUrl.replace(/\/{2,}/g, '/');
        sanitizedBaseUrl = sanitizedBaseUrl.startsWith('/') ? sanitizedBaseUrl : `/${sanitizedBaseUrl}`;
        await app.register(this._router, {
            prefix: `${sanitizedBaseUrl}${this._routerPrefix}`
        });
    }

    /**
     * Initialize the routes of the router.
     *
     * @param fastify - The Fastify instance. ({@link FastifyInstance})
     */
    protected abstract _initRoutes(fastify: FastifyInstance): void;

    /**
     * Get the router.
     *
     * @returns The router. ({@link FastifyPluginAsync})
     */
    private get _router(): FastifyPluginAsync {
        return (fastify: FastifyInstance): Promise<void> => {
            this._initRoutes(fastify);
            return Promise.resolve();
        };
    }
}

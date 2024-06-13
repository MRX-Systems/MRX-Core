import type { FastifyInstance, FastifyPluginAsync } from 'fastify';

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
     * Initialize the routes of the router.
     *
     * @param fastify - The Fastify instance.
     */
    protected abstract initRoutes(fastify: FastifyInstance): void;

    /**
     * Configure the router.
     *
     * @param app - The Fastify instance.
     * @param baseUrl - The base URL of the router.
     */
    public async configure(app: FastifyInstance, baseUrl: string): Promise<void> {
        await app.register(this._router, {
            prefix: `${baseUrl}${this._routerPrefix}`
        });
    }

    /**
     * Get the router.
     */
    private get _router(): FastifyPluginAsync {
        return (fastify: FastifyInstance): Promise<void> => {
            this.initRoutes(fastify);
            return Promise.resolve();
        };
    }
}

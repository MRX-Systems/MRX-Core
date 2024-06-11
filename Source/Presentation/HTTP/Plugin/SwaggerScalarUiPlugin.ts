
import type { FastifyInstance } from 'fastify';

import type { IPlugin } from '@/Presentation/HTTP/Interface';

// alternate, default, moon, purple, solarized, bluePlanet, saturn, kepler, mars, deepSpace, none

/**
 * The options for the SwaggerScalarUi plugin.
 */
export interface ISwaggerScalarUiPluginOptions {
    /**
     * The base URL of the SwaggerScalarUi. (Default: '/')
     */
    baseUrl?: string;
    /**
     * The path of the SwaggerScalarUi. (Default: '/swagger')
     */
    path?: string;
    /**
     * The theme of the SwaggerScalarUi. (Default: 'default')
     */
    theme?: 'default' | 'alternate' | 'moon' | 'purple' | 'solarized' | 'bluePlanet' | 'saturn' | 'kepler' | 'mars' | 'deepSpace';
}


/**
 * The SwaggerScalarUi plugin.
 */
export class SwaggerScalarUiPlugin implements IPlugin {
    /**
     * The base URL of the SwaggerScalarUi.
     */
    private readonly _baseUrl: string;

    /**
     * The path of the SwaggerScalarUi.
     */
    private readonly _path: string;

    /**
     * The theme of the SwaggerScalarUi.
     */
    private readonly _theme: 'default' | 'alternate' | 'moon' | 'purple' | 'solarized' | 'bluePlanet' | 'saturn' | 'kepler' | 'mars' | 'deepSpace';

    /**
     * Constructor of the SwaggerScalarUiPlugin.
     * 
     * @param options - The options for the SwaggerScalarUi. ({@link ISwaggerScalarUiPluginOptions})
     */
    public constructor(options?: ISwaggerScalarUiPluginOptions) {
        this._baseUrl = options?.baseUrl ?? '/';
        this._path = options?.path ?? '/swagger';
        this._theme = options?.theme ?? 'default';
    }

    /**
     * Configures the SwaggerScalarUi.
     * 
     * @param app - The Fastify instance.
     */
    public async configure(app: FastifyInstance): Promise<void> {
        const routePrefix = `${this._baseUrl}${this._path}`;
        routePrefix.replace(/\/+/g, '/');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
        await app.register(require('@scalar/fastify-api-reference'), {
            routePrefix: `${this._baseUrl}${this._path}`,
            configuration: {
                theme: this._theme,
            },
        });
    }
}

import type { FastifyInstance } from 'fastify';

import type { IPlugin } from '@/Presentation/HTTP/Interface';


/**
 * The options for the SwaggerScalarUi plugin.
 */
export interface ISwaggerScalarUiPluginOptions {
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
 * The SwaggerScalarUi plugin implement the IPlugin interface ({@link IPlugin})
 */
export class SwaggerScalarUiPlugin implements IPlugin {
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
        this._path = options?.path ?? '/swagger';
        this._theme = options?.theme ?? 'default';
    }

    /**
     * Configures the SwaggerScalarUi.
     *
     * @param app - The Fastify instance. ({@link FastifyInstance})
     * @param baseUrl - The base URL of the SwaggerScalarUi.
     */
    public async configure(app: FastifyInstance, baseUrl: string): Promise<void> {
        const routePrefix = `${baseUrl}${this._path}`;
        routePrefix.replace(/\/+/g, '/');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
        await app.register(require('@scalar/fastify-api-reference'), {
            routePrefix,
            configuration: {
                theme: this._theme,
            },
        });
    }
}

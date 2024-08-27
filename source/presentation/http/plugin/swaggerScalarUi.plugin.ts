import scalar from '@scalar/fastify-api-reference';
import type { FastifyInstance } from 'fastify';

import type { Plugin } from '@/common/types/index.ts';


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
 * The SwaggerScalarUi plugin implement the IPlugin interface ({@link Plugin})
 */
export class SwaggerScalarUiPlugin implements Plugin {
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
        await app.register(scalar, {
            routePrefix,
            configuration: {
                theme: this._theme,
            },
        });
    }
}

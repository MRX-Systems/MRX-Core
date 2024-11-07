import scalar from '@scalar/fastify-api-reference';
import type { FastifyInstance, FastifyPluginCallback } from 'fastify';

import type { Plugin } from '#/common/types/index.ts';

/**
 * The options for the SwaggerScalarUi plugin.
 */
export interface SwaggerScalarUiPluginOptions {
    /**
     * The path of the SwaggerScalarUi. (Default: '/swagger')
     */
    path?: string | undefined;
    /**
     * The theme of the SwaggerScalarUi. (Default: 'default')
     */
    theme?: 'default' | 'alternate' | 'moon' | 'purple' | 'solarized' | 'bluePlanet' | 'saturn' | 'kepler' | 'mars' | 'deepSpace' | undefined;

    /**
     * The meta data for the SwaggerScalarUi.
     */
    metaData?: {
        /**
         * The title of the SwaggerScalarUi.
         */
        title?: string;
        /**
         * The description of the SwaggerScalarUi.
         */
        description?: string;
        /**
         * Other meta data for the SwaggerScalarUi.
         */
        [key: string]: string;
    } | undefined;

    /**
     * The custom CSS for the SwaggerScalarUi.
     */
    customCss?: string | undefined;

    /**
     * The custom key used with CTRL/CMD to open the search modal
     */
    searchHotKey?: string | undefined;

    /**
     * Fav icon for the SwaggerScalarUi
     */
    favIcon?: string | undefined;
}

interface PluginOptions {
    routePrefix: string;
    configuration: SwaggerScalarUiPluginOptions;
}

/**
 * The SwaggerScalarUi plugin implement the IPlugin interface ({@link Plugin})
 */
export class SwaggerScalarUiPlugin implements Plugin {
    private readonly _options: SwaggerScalarUiPluginOptions;

    /**
     * Constructor of the SwaggerScalarUiPlugin.
     *
     * @param options - The options for the SwaggerScalarUi. ({@link SwaggerScalarUiPluginOptions})
     */
    public constructor(options?: SwaggerScalarUiPluginOptions) {
        this._options = {
            path: options?.path ?? '/swagger',
            theme: options?.theme ?? 'default',
            metaData: options?.metaData ?? {},
            customCss: options?.customCss ?? '',
            searchHotKey: options?.searchHotKey ?? 'l',
            favIcon: options?.favIcon ?? ''
        };
    }

    /**
     * Configures the SwaggerScalarUi.
     *
     * @param app - The Fastify instance. ({@link FastifyInstance})
     * @param baseUrl - The base URL of the SwaggerScalarUi.
     */
    public async configure(app: FastifyInstance, baseUrl: string): Promise<void> {
        const routePrefix = `${baseUrl}${this._options.path}`.replace(/\/+/g, '/');
        const pluginOptions: PluginOptions = {
            routePrefix,
            configuration: {
                theme: this._options.theme,
                metaData: this._options.metaData,
                customCss: this._options.customCss,
                searchHotKey: this._options.searchHotKey
            }
        };
        await app.register(scalar as FastifyPluginCallback, pluginOptions);
    }
}

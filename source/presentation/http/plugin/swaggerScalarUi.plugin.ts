import scalar from '@scalar/fastify-api-reference';
import type { FastifyInstance } from 'fastify';

import type { Plugin, SwaggerScalarUiPluginOptions } from '#/common/types/index.js';

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
            favIcon: options?.favIcon ?? '',
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
        await app.register(scalar, {
            routePrefix,
            configuration: {
                theme: this._options.theme,
                metaData: this._options.metaData,
                customCss: this._options.customCss,
                searchHotKey: this._options.searchHotKey
            },
        });
    }
}

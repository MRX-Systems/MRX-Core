import ajvError from 'ajv-errors';
import ajvFormats from 'ajv-formats';
import { parse } from 'fast-querystring';
import fastify, { type FastifyError, type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';

import { AndesiteError } from '@/Common/Error/index.js';
import { PresentationHttpServerErrorKeys } from '@/Common/Error/Enum/index.js';
import { I18n } from '@/Common/Util/index.js';
import { LoggerHook } from '@/Presentation/HTTP/Hook/index.js';
import type { IHook, IPlugin, IServerOptions, IStartOptions } from '@/Presentation/HTTP/Interface/index.js';
import { FormBodyPlugin, HelmetPlugin } from '@/Presentation/HTTP/Plugin/index.js';
import type { AbstractRouter } from '@/Presentation/HTTP/Router/index.js';

export type { FastifyInstance };

/**
 * ServerManager class is responsible for managing the Fastify server instance. (Singleton Pattern)
 */
export class ServerManager {
    /**
     * The Fastify instance. ({@link FastifyInstance})
     */
    private readonly _app: FastifyInstance;

    /**
     * The options for starting the server. ({@link IStartOptions})
     */
    private _startOptions: Partial<IStartOptions> = {};

    /**
     * The options for the server. ({@link IServerOptions})
     */
    private readonly _options: IServerOptions;

    /**
     * Constructor of the ServerManager class.
     *
     * @param options - The options for the server. ({@link IServerOptions})
     */
    public constructor(options: IServerOptions) {
        this._options = options;
        this._app = fastify({
            querystringParser: str => parse(str),
            logger: false,
            ignoreTrailingSlash: true,
            trustProxy: true,
            ignoreDuplicateSlashes: true,
            ajv: {
                customOptions: {
                    $data: true,
                    removeAdditional: true,
                    allowUnionTypes: true,
                    coerceTypes: true,
                    allErrors: true,
                    parseDate: true,
                    allowDate: true,
                    strict: true,
                    strictTypes: true,
                    strictTuples: true,
                    strictNumbers: true,
                    strictRequired: true,
                    strictSchema: true,
                },
                plugins: [
                    ajvError.default,
                    ajvFormats.default
                ],
            },

        });
        this._app.setErrorHandler(this._setErrorHandler.bind(this));
    }

    /**
     * Get the port of the server.
     *
     * @returns The port of the server.
     */
    public get port(): number {
        return this._startOptions.port ?? 3000;
    }

    /**
     * Get the host of the server.
     *
     * @returns The host of the server.
     */
    public get host(): string {
        return this._startOptions.host ?? '0.0.0.0';
    }

    /**
     * Get the Fastify instance.
     *
     * @returns The Fastify instance. ({@link FastifyInstance})
     */
    public get app(): FastifyInstance {
        return this._app;
    }

    /**
     * Add hook to the Fastify instance.
     *
     * @param Hook - The hook to add. ({@link IHook})
     */
    public async addHook(hook: IHook): Promise<void> {
        await hook.configure(this._app);
    }

    /**
     * Add hooks to the Fastify instance.
     *
     * @param hooks - The hooks to add. ({@link IHook})
     */
    public async addHooks(hooks: IHook[]): Promise<void> {
        await Promise.all(hooks.map(hook => hook.configure(this._app)));
    }

    /**
     * Add plugin to the Fastify instance.
     *
     * @param plugin - The plugin to add. ({@link IPlugin})
     */
    public async addPlugin(plugin: IPlugin): Promise<void> {
        await plugin.configure(this._app, this._options.baseUrl ?? '/');
    }

    /**
     * Add plugins to the Fastify instance.
     *
     * @param plugins - The plugins to add. ({@link IPlugin})
     */
    public async addPlugins(plugins: IPlugin[]): Promise<void> {
        await Promise.all(plugins.map(plugin => plugin.configure(this._app, this._options.baseUrl ?? '/')));
    }

    /**
     * Add router to the Fastify instance.
     *
     * @param router - The router to add. ({@link AbstractRouter})
     */
    public async addRouter(router: AbstractRouter): Promise<void> {
        await router.configure(this._app, this._options.baseUrl ?? '/');
    }

    /**
     * Add routers to the Fastify instance.
     *
     * @param routers - The routers to add. ({@link AbstractRouter})
     */
    public async addRouters(routers: AbstractRouter[]): Promise<void> {
        await Promise.all(routers.map(router => router.configure(this._app, this._options.baseUrl ?? '/')));
    }

    /**
     * Close the server.
     */
    public async close(): Promise<void> {
        await this._app.close();
    }

    /**
     * Start the server.
     *
     * @param startOptions - The options for starting the server. ({@link IStartOptions})
     */
    public async start(startOptions: Partial<IStartOptions>): Promise<void> {
        this._startOptions = startOptions;
        this._addDefaultHooks();
        await this._addDefaultPlugins();
        await this._app.ready();
        await this._app.listen({
            port: this._startOptions.port ?? 3000,
            host: this._startOptions.host ?? '0.0.0.0'
        });
    }

    /**
     * Handle the validation errors.
     *
     * @param error - The error with validation. ({@link FastifyError})
     * @param request - The request. ({@link FastifyRequest})
     * @param reply - The reply. ({@link FastifyReply})
     */
    private async _handleValidationErrors(error: FastifyError, request: FastifyRequest, reply: FastifyReply): Promise<void> {
        const rawAjvError = error.validation;
        if (!rawAjvError) return;
        const sanitezedAjvError = rawAjvError.map(e => {
            e.message = `error.presentation.schema.${e.message}`;
            if (e.instancePath === '') {
                const [param] = e.params?.errors as Array<{ params: { missingProperty: string } }>;
                return {
                    property: param?.params.missingProperty,
                    constraints: I18n.isI18nInitialized() ? I18n.translate(e.message, request.headers['accept-language']) : e.message
                };
            }
            return {
                property: e.instancePath.slice(1),
                constraints: I18n.isI18nInitialized() ? I18n.translate(e.message, request.headers['accept-language']) : e.message
            };
        });
        await reply.status(400).send({
            content: sanitezedAjvError,
            statusCode: 400,
        });
    }

    /**
     * Set the error handler.
     *
     * @param error - The error to handle. ({@link FastifyError})
     * @param request - The request. ({@link FastifyRequest})
     * @param reply - The reply. ({@link FastifyReply})
     */
    private async _setErrorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply): Promise<void> {
        if (this._options.logger)
            this._options.logger.error(error);
        if (error.validation)
            await this._handleValidationErrors(error, request, reply);
        else if (error instanceof AndesiteError)
            await reply.status(400).send({
                code: error.code,
                message: I18n.isI18nInitialized() ? I18n.translate(
                    error.message,
                    request.headers['accept-language']
                ) : error.message,
                ...error.code < 500 ? { detail: error.detail } : {}
            });
        else
            await reply.status(500).send({
                code: 500,
                message: I18n.isI18nInitialized() ? I18n.translate(
                    PresentationHttpServerErrorKeys.INTERNAL_SERVER_ERROR,
                    request.headers['accept-language']
                ) : PresentationHttpServerErrorKeys.INTERNAL_SERVER_ERROR,
            });
    }

    /**
     * Add default hooks to the Fastify instance.
     */
    private _addDefaultHooks(): void {
        if (this._options.logger)
            (new LoggerHook(this._options.logger)).configure(this._app);
    }

    /**
     * Add default plugins to the Fastify instance.
     * (Helmet, FormBody)
     */
    private async _addDefaultPlugins(): Promise<void> {
        await Promise.all([
            (new FormBodyPlugin()).configure(this._app),
            (new HelmetPlugin()).configure(this._app)
        ]);
    }
}

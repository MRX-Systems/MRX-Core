import { BasaltLogger } from '@basalt-lab/basalt-logger';
import ajvError from 'ajv-errors';
import ajvFormats from 'ajv-formats';
import { parse } from 'fast-querystring';
import fastify, { type FastifyError, type FastifyReply, type FastifyRequest, type FastifyInstance } from 'fastify';

import { AndesiteError } from '@/Common/Error';
import { PresentationHttpServerErrorKeys } from '@/Common/Error/Enum';
import { I18n } from '@/Common/Util';
import { LoggerHook } from '@/Presentation/HTTP/Hook';
import type { IHook, IPlugin, IServerOptions, IStartOptions } from '@/Presentation/HTTP/Interface';
import { FormBodyPlugin, HelmetPlugin } from '@/Presentation/HTTP/Plugin';
import type { AbstractRouter } from '@/Presentation/HTTP/Router';

export type { FastifyInstance };

/**
 * ServerManager class is responsible for managing the Fastify server instance. (Singleton Pattern)
 */
export class ServerManager {
    /**
     * The Fastify instance.
     */
    private readonly _app: FastifyInstance;

    /**
     * The options for the server.
     */
    private readonly _options: IServerOptions;

    /**
     * Constructor of the ServerManager class.
     *
     * @param options - The options for the server.
     */
    public constructor(options: IServerOptions) {
        this._options = options;
        this._app = fastify({
            ...options.http2 ? { http2: true } : {},
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
                    ajvError,
                    ajvFormats
                ],
            }
        });
        this._app.setErrorHandler(this._setErrorHandler.bind(this));
    }

    /**
     * Get the Fastify instance.
     *
     * @returns The Fastify instance.
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
        await plugin.configure(this._app);
    }

    /**
     * Add plugins to the Fastify instance.
     *
     * @param plugins - The plugins to add. ({@link IPlugin})
     */
    public async addPlugins(plugins: IPlugin[]): Promise<void> {
        await Promise.all(plugins.map(plugin => plugin.configure(this._app)));
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
     * @param options - The start options.
     */
    public async start(options: IStartOptions): Promise<void> {
        this._addDefaultHooks();
        await this._addDefaultPlugins();
        await this._app.ready();
        await this._app.listen({
            port: options.port,
            host: options.host ?? '0.0.0.0'
        });
    }

    /**
     * Handle the validation errors.
     *
     * @param error - The error with validation.
     * @param request - The request.
     * @param reply - The reply.
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
     * @param error - The error to handle.
     * @param request - The request.
     * @param reply - The reply.
     */
    private async _setErrorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply): Promise<void> {
        if (this._options.logger)
            BasaltLogger.error(error);
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
            (new LoggerHook()).configure(this._app);
    }

    /**
     * Add default plugins to the Fastify instance.
     */
    private async _addDefaultPlugins(): Promise<void> {
        await Promise.all([
            (new FormBodyPlugin()).configure(this._app),
            (new HelmetPlugin()).configure(this._app)
        ]);
    }
}

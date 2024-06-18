import { BasaltLogger } from '@basalt-lab/basalt-logger';
import ajvError from 'ajv-errors';
import ajvFormats from 'ajv-formats';
import { parse } from 'fast-querystring';
import fastify, { type FastifyError, type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';

import { AndesiteError } from '@/Common/Error';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CommonErrorKeys, PresentationHttpServerErrorKeys } from '@/Common/Error/Enum';
import { I18n } from '@/Common/Util';
import type { IAndesiteApiConfigDTO } from '@/DTO';
import { AndesiteYml } from '@/Domain/Service/User/Config';
import { LoggerHook } from '@/Presentation/HTTP/Hook';
import type { IHook, IPlugin } from '@/Presentation/HTTP/Interface';
import { FormBodyPlugin, HelmetPlugin } from '@/Presentation/HTTP/Plugin';
import type { AbstractRouter } from '@/Presentation/HTTP/Router';

export type { FastifyInstance };

/**
 * ServerManager class is responsible for managing the Fastify server instance. (Singleton Pattern)
 */
export class ServerManager {
    /**
     * Instance of the ServerManager class. ({@link ServerManager})
     */
    private static _instance: ServerManager;

    /**
     * The Fastify instance. ({@link FastifyInstance})
     */
    private readonly _app: FastifyInstance;

    /**
     * The options for the server. ({@link IAndesiteApiConfigDTO})
     */
    private readonly _options: IAndesiteApiConfigDTO;

    /**
     * Constructor of the ServerManager class.
     */
    public constructor() {
        this._options = this._getServerOptions();
        this._app = fastify({
            ...this._options.Server.Http2 ? { http2: true } : {},
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
        return this._options.Server.Port ?? 3000;
    }

    /**
     * Get the host of the server.
     *
     * @returns The host of the server.
     */
    public get host(): string {
        return this._options.Server.Host ?? '0.0.0.0';
    }

    /**
     * Get the instance of the ServerManager class.
     *
     * @returns The instance of the ServerManager class. ({@link ServerManager})
     */
    public static get instance(): ServerManager {
        if (!ServerManager._instance)
            ServerManager._instance = new ServerManager();
        return ServerManager._instance;
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
        await plugin.configure(this._app, this._options.Server.BaseUrl ?? '/');
    }

    /**
     * Add plugins to the Fastify instance.
     *
     * @param plugins - The plugins to add. ({@link IPlugin})
     */
    public async addPlugins(plugins: IPlugin[]): Promise<void> {
        await Promise.all(plugins.map(plugin => plugin.configure(this._app, this._options.Server.BaseUrl ?? '/')));
    }

    /**
     * Add router to the Fastify instance.
     *
     * @param router - The router to add. ({@link AbstractRouter})
     */
    public async addRouter(router: AbstractRouter): Promise<void> {
        await router.configure(this._app, this._options.Server.BaseUrl ?? '/');
    }

    /**
     * Add routers to the Fastify instance.
     *
     * @param routers - The routers to add. ({@link AbstractRouter})
     */
    public async addRouters(routers: AbstractRouter[]): Promise<void> {
        await Promise.all(routers.map(router => router.configure(this._app, this._options.Server.BaseUrl ?? '/')));
    }

    /**
     * Close the server.
     */
    public async close(): Promise<void> {
        await this._app.close();
    }

    /**
     * Start the server.
     */
    public async start(): Promise<void> {
        this._addDefaultHooks();
        await this._addDefaultPlugins();
        await this._app.ready();
        await this._app.listen({
            port: this._options.Server.Port ?? 3000,
            host: this._options.Server.Host ?? '0.0.0.0'
        });
    }

    /**
     * Get the server options. (from andesite.yml of the user)
     *
     * @throws ({@link AndesiteError}) If the file access is denied. ({@link CommonErrorKeys.ERROR_ACCESS_FILE})
     * @throws ({@link AndesiteError}) If the file read fails. ({@link CommonErrorKeys.ERROR_READ_FILE})
     *
     * @returns The server options. ({@link IAndesiteApiConfigDTO})
     */
    private _getServerOptions(): IAndesiteApiConfigDTO {
        const andesiteYml = new AndesiteYml();
        return andesiteYml.readConfig() as IAndesiteApiConfigDTO;
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
        if (this._options.Server.Logger)
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
        if (this._options.Server.Logger)
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

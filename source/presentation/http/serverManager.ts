import type { BasaltError } from '@basalt-lab/basalt-helper';
import type { BasaltLogger } from '@basalt-lab/basalt-logger';
import ajvError from 'ajv-errors';
import ajvFormats from 'ajv-formats';
import { parse } from 'fast-querystring';

import type { CoreError } from '#/common/error/core.error.ts';
import { ErrorKeys } from '#/common/error/keys.error.ts';
import { fastify, type FastifyError, type FastifyInstance, type FastifyReply, type FastifyRequest } from '#/common/lib/required/fastify/fastify.lib.ts';
import type { Hook } from '#/common/type/data/presentation/http/hook.data.ts';
import type { Plugin } from '#/common/type/data/presentation/http/plugin.data.ts';
import { I18n } from '#/common/util/i18n.util.ts';
import { LanguageHook } from './hook/language.hook.ts';
import { LoggerHook } from './hook/logger.hook.ts';
import { QueryParseHook } from './hook/queryParse.hook.ts';
import type { AbstractRouter } from './router/abstract.router.ts';

/**
 * Interface is responsible for defining the options for starting the server.
 */
export interface StartOptions {
    /**
     * The port number for the server.
     */
    port: number;

    /**
     * The host for the server.
     */
    host: string;
}

/**
 * Interface is responsible for defining the options for the server.
 */
export interface ServerOptions {

    /**
     * The base URL of the server. (Default: '/')
     */
    baseUrl: string;

    /**
     * Enable HTTP/2.
     */
    http2: boolean;

    /**
     * Instance of BasaltLogger allowing to log messages in one or more strategies. ({@link BasaltLogger})
     */
    logger: BasaltLogger | undefined;
}

/**
 * ServerManager class is responsible for managing the Fastify server instance. (Singleton Pattern)
 */
export class ServerManager {
    /**
     * The Fastify instance. ({@link FastifyInstance})
     */
    private readonly _app: FastifyInstance;

    /**
     * The options for starting the server. ({@link StartOptions})
     */
    private _startOptions: StartOptions = {
        port: 3000,
        host: '0.0.0.0'
    };

    /**
     * The options for the server. ({@link ServerOptions})
     */
    private readonly _options: ServerOptions = {
        baseUrl: '/',
        http2: false,
        logger: undefined
    };

    /**
     * Constructor of the ServerManager class.
     *
     * @param options - The options for the server. ({@link ServerOptions})
     */
    public constructor(options?: Partial<ServerOptions>) {
        this._options = {
            ...this._options,
            ...options
        };
        this._app = fastify({
            querystringParser: (str) => parse(str),
            logger: false,
            ignoreTrailingSlash: true,
            trustProxy: true,
            ignoreDuplicateSlashes: true,
            ajv: {
                customOptions: {
                    $data: true,
                    removeAdditional: false,
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
                    code: {
                        optimize: true,
                        esm: true
                    }
                },
                plugins: [
                    ajvError.default,
                    ajvFormats.default
                ]
            }
        });
        this._app.setErrorHandler(this._setErrorHandler.bind(this));
        this._addDefaultHooks();
    }

    /**
     * Get the port of the server.
     *
     * @returns The port of the server.
     */
    public get port(): number {
        return this._startOptions.port;
    }

    /**
     * Get the host of the server.
     *
     * @returns The host of the server.
     */
    public get host(): string {
        return this._startOptions.host;
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
     * @param Hook - The hook to add. ({@link Hook})
     */
    public async addHook(hook: Hook): Promise<void> {
        await hook.configure(this._app);
    }

    /**
     * Add hooks to the Fastify instance.
     *
     * @param hooks - The hooks to add. ({@link Hook})
     */
    public async addHooks(hooks: Hook[]): Promise<void> {
        await Promise.all(hooks.map((hook) => hook.configure(this._app)));
    }

    /**
     * Add plugin to the Fastify instance.
     *
     * @param plugin - The plugin to add. ({@link Plugin})
     */
    public async addPlugin(plugin: Plugin): Promise<void> {
        await plugin.configure(this._app, this._options.baseUrl);
    }

    /**
     * Add plugins to the Fastify instance.
     *
     * @param plugins - The plugins to add. ({@link Plugin})
     */
    public async addPlugins(plugins: Plugin[]): Promise<void> {
        await Promise.all(plugins.map((plugin) => plugin.configure(this._app, this._options.baseUrl)));
    }

    /**
     * Add router to the Fastify instance.
     *
     * @param router - The router to add. ({@link AbstractRouter})
     */
    public async addRouter(router: AbstractRouter): Promise<void> {
        await router.configure(this._app, this._options.baseUrl);
    }

    /**
     * Add routers to the Fastify instance.
     *
     * @param routers - The routers to add. ({@link AbstractRouter})
     */
    public async addRouters(routers: AbstractRouter[]): Promise<void> {
        await Promise.all(routers.map((router) => router.configure(this._app, this._options.baseUrl)));
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
     * @param startOptions - The options for starting the server. ({@link StartOptions})
     */
    public async start(startOptions?: Partial<StartOptions>): Promise<void> {
        this._startOptions = {
            ...this._startOptions,
            ...startOptions
        };
        await this._app.ready();
        await this._app.listen({
            port: this._startOptions.port,
            host: this._startOptions.host
        });
        if (this._options.logger)
            this._options.logger.info(`Server listening on ${this._startOptions.host}:${this._startOptions.port}`);
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
        const sanitezedAjvError = rawAjvError?.map((e) => {
            const keyword = `error.presentation.schema.${e.keyword}`;
            const { instancePath, params } = e;
            const { missingProperty } = params;
            if (instancePath === '' && params && missingProperty)
                return {
                    property: missingProperty,
                    message: I18n.isI18nInitialized()
                        ? I18n.translate(keyword, request.headers['accept-language'], { property: missingProperty })
                        : keyword,
                    contraints: params
                };
            return {
                property: e.instancePath.slice(1),
                message: I18n.isI18nInitialized()
                    ? I18n.translate(keyword, request.headers['accept-language'], { property: e.instancePath.slice(1) })
                    : keyword,
                contraints: params
            };
        });
        await reply.status(400).send({
            statusCode: 400,
            content: sanitezedAjvError
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
        if ('validation' in error) {
            await this._handleValidationErrors(error, request, reply);
        } else if (error.name === 'CoreError' || error.name === 'BasaltError') {
            const e: CoreError | BasaltError = error as unknown as CoreError | BasaltError;
            const code: number = e.code;
            const cause: Record<string, unknown> = typeof e.cause === 'object' ? e.cause as Record<string, unknown> : {};
            await reply.status(code).send({
                statusCode: error.code,
                message: I18n.isI18nInitialized()
                    ? I18n.translate(
                        error.message,
                        request.headers['accept-language'],
                        cause
                    )
                    : error.message,
                content: e.cause
            });
        } else {
            await reply.status(500).send({
                statusCode: 500,
                message: I18n.isI18nInitialized()
                    ? I18n.translate(
                        ErrorKeys.INTERNAL_SERVER_ERROR,
                        request.headers['accept-language']
                    )
                    : ErrorKeys.INTERNAL_SERVER_ERROR,
                content: error.message
            });
        }
    }

    /**
     * Add default hooks to the Fastify instance.
     */
    private _addDefaultHooks(): void {
        if (this._options.logger)
            (new LoggerHook(this._options.logger)).configure(this._app);
        (new LanguageHook()).configure(this._app);
        (new QueryParseHook()).configure(this._app);
    }
}

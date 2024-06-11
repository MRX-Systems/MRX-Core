import AjvError from 'ajv-errors';
import AjvFormats from 'ajv-formats';
import { parse } from 'fast-querystring';
import fastify, { type FastifyInstance } from 'fastify';

import { LoggerHook } from './Hook';
import type { IHook, IPlugin, IServerOptions, IStartOptions } from './Interface';
import { FormBodyPlugin, HelmetPlugin } from './Plugin';

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
                    AjvError,
                    AjvFormats
                ],
            }
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

    /**
     * Add hook to the Fastify instance.
     * 
     * @param Hook - The hook to add.
     */
    public async addHook(hook: IHook): Promise<void> {
        await hook.configure(this._app);
    }

    /**
     * Add plugin to the Fastify instance.
     * 
     * @param plugin - The plugin to add.
     */
    public async addPlugin(plugin: IPlugin): Promise<void> {
        await plugin.configure(this._app);
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
     * Get the Fastify instance.
     * 
     * @returns The Fastify instance.
     */
    public get app(): FastifyInstance {
        return this._app;
    }
}
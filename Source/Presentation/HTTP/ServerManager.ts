import AjvError from 'ajv-errors';
import AjvFormats from 'ajv-formats';
import { parse } from 'fast-querystring';
import fastify, { type FastifyInstance } from 'fastify';

import { LoggerHook } from './Hook';
import type { IHook, IPlugin, IServerOptions, IStartOptions } from './Interface';
import { FormBodyPlugin } from './Plugins';

/**
 * ServerManager class is responsible for managing the Fastify server instance. (Singleton Pattern)
 */
export class ServerManager {
    /**
     * The Fastify instance.
     */
    private readonly _app: FastifyInstance;

    /**
     * The plugins for the server.
     */
    private readonly _plugins: IPlugin[] = [];

    /**
     * The hooks for the server.
     */
    private readonly _hooks: IHook[] = [];

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
     * Initialize hooks to the Fastify instance.
     */
    private async _initializeHooks(): Promise<void> {
        for (const hook of this._hooks) 
            await hook.configure(this._app);
    }

    /**
     * Initialize plugins to the Fastify instance.
     */
    private async _initializePlugins(): Promise<void> {
        for (const plugin of this._plugins) 
            await plugin.configure(this._app);   
    }

    /**
     * Add default hooks to the Fastify instance.
     */
    private _addDefaultHooks(): void {
        if (this._options.logger) 
            this._hooks.push(new LoggerHook());
    }

    /**
     * Add default plugins to the Fastify instance.
     */
    private _addDefaultPlugins(): void {
        this._plugins.push(new FormBodyPlugin());
    }

    /**
     * Add hook to the Fastify instance.
     * 
     * @param hook - The hook to add.
     */
    public addHook(hook: IHook): void {
        this._hooks.push(hook);
    }

    /**
     * Add plugin to the Fastify instance.
     * 
     * @param plugin - The plugin to add.
     */
    public addPlugin(plugin: IPlugin): void {
        this._plugins.push(plugin);
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
        this._addDefaultPlugins();
    
        await Promise.all([
            this._initializeHooks(),
            this._initializePlugins()
        ]);

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
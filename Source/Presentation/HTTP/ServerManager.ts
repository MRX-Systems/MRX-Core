import AjvError from 'ajv-errors';
import AjvFormats from 'ajv-formats';
import { parse } from 'fast-querystring';
import fastify, { type FastifyInstance } from 'fastify';

import { loggerHook } from './Hook';
import type { IServerOptions, IStartOptions } from './Interface';

/**
 * ServerManager class is responsible for managing the Fastify server instance. (Singleton Pattern)
 */
export class ServerManager {
    /**
     * The Fastify instance.
     * @readonly
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
     * Add hooks to the Fastify instance.
     */
    private _addHooks(): void {
        if (this._options.logger) 
            this._app.addHook('onRequest', loggerHook);
    }

    /**
     * Add plugins to the Fastify instance.
     */
    private _addPlugins(): void {
    }

    public async close(): Promise<void> {
        await this._app.close();
    }

    public async start(options: IStartOptions): Promise<void> {
        this._addHooks();

        await this._app.ready();
        await this._app.listen({
            port: options.port,
            host: options.host ?? '0.0.0.0'
        });
    }

    public get app(): FastifyInstance {
        return this._app;
    }
}
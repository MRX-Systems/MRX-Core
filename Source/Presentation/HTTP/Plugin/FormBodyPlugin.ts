import formBody from '@fastify/formbody';
import type { FastifyInstance } from 'fastify';
import { parse } from 'fast-querystring';

import type { IPlugin } from '@/Presentation/HTTP/Interface/index.js';

/**
 * The options for the FormBody.
 */
export interface IFormBodyOptions {
    /**
     * The body limit for the FormBody. (default: 1048576)
     */
    bodyLimit?: number;
}
/**
 * The FormBody plugin implement the IPlugin interface ({@link IPlugin})
 */
export class FormBodyPlugin implements IPlugin {
    /**
     * The options for the FormBody. ({@link IFormBodyOptions})
     */
    private readonly _options: IFormBodyOptions | undefined;

    /**
     * Constructor of the FormBodyPlugin.
     *
     * @param options - The options for the FormBody. ({@link IFormBodyOptions})
     */
    public constructor(options?: IFormBodyOptions) {
        this._options = options;
    }

    /**
     * Configures the FormBody.
     *
     * @param app - The Fastify instance. ({@link FastifyInstance})
     */
    public async configure(app: FastifyInstance): Promise<void> {
        await app.register(formBody, {
            parser: (str) => parse(str),
            bodyLimit: this._options?.bodyLimit ?? 1048576,
        });
    }
}

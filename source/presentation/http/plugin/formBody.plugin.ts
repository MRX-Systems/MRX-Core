import formBody from '@fastify/formbody';
import type { FastifyInstance } from 'fastify';
import { parse } from 'fast-querystring';

import type { Plugin, FormBodyOptions } from '@/common/types';

/**
 * The FormBody plugin implement the IPlugin interface ({@link Plugin})
 */
export class FormBodyPlugin implements Plugin {
    /**
     * The options for the FormBody. ({@link FormBodyOptions})
     */
    private readonly _options: FormBodyOptions | undefined;

    /**
     * Constructor of the FormBodyPlugin.
     *
     * @param options - The options for the FormBody. ({@link FormBodyOptions})
     */
    public constructor(options?: FormBodyOptions) {
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

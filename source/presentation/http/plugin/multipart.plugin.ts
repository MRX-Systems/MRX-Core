import fastifyMultipart from '@fastify/multipart';

import type { FastifyInstance } from '#/common/lib/required/fastify/fastify.lib.ts';
import type { Plugin } from '#/common/type/data/presentation/http/plugin.data.ts';

/**
 * The options for the Multipart.
 */
export interface MultipartOptions {
    /**
     * Whether to attach fields to body for the Multipart. (default: true)
     */
    attachFieldsToBody?: boolean;
    /**
     * Whether to throw an error when the file size limit is reached for the Multipart. (default: true)
     */
    throwFileSizeLimit?: boolean;
    /**
     * The field name size in bytes for the Multipart. (default: 100)
     */
    fieldNameSize?: number;
    /**
     * The field size in bytes for the Multipart. (default: 100)
     */
    fieldSize?: number;
    /**
     * The fields for the Multipart. (default: 10)
     */
    fields?: number;
    /**
     * The file size in bytes for the Multipart. (default: 1000000)
     */
    fileSize?: number;
    /**
     * The header pairs for the Multipart. (default: 2000)
     */
    headerPairs?: number;
    /**
     * The parts for the Multipart. (default: 1000)
     */
    parts?: number;
}

/**
 * The Multipart plugin implement the Plugin interface ({@link Plugin})
 */
export class MultipartPlugin implements Plugin {
    /**
     * The options for the Multipart. ({@link MultipartOptions})
     */
    private readonly _options: MultipartOptions | undefined;

    /**
     * Constructor of the MultipartPlugin.
     *
     * @param options - The options for the Multipart. ({@link MultipartOptions})
     */
    public constructor(options?: MultipartOptions) {
        this._options = options;
    }

    /**
     * Configures the Multipart.
     *
     * @param app - The Fastify instance. ({@link FastifyInstance})
     */
    public async configure(app: FastifyInstance): Promise<void> {
        await app.register(fastifyMultipart, {
            attachFieldsToBody: this._options?.attachFieldsToBody ?? true,
            throwFileSizeLimit: this._options?.throwFileSizeLimit ?? true,
            limits: {
                fieldNameSize: this._options?.fieldNameSize ?? 100,
                fieldSize: this._options?.fieldSize ?? 100,
                fields: this._options?.fields ?? 10,
                fileSize: this._options?.fileSize ?? 10 * 1024 * 1024,
                headerPairs: this._options?.headerPairs ?? 2000,
                parts: this._options?.parts ?? 1000
            }
        });
    }
}

import fastifyMultipart from '@fastify/multipart';

import type { FastifyInstance, Plugin } from '#/common/types/index.ts';

/**
 * The options for the Multipart.
 */
export interface MultipartOptions {
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
     * The files for the Multipart. (default: 1)
     */
    files?: number;
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
            limits: {
                fieldNameSize: this._options?.fieldNameSize ?? 100,
                fieldSize: this._options?.fieldSize ?? 100,
                fields: this._options?.fields ?? 10,
                fileSize: this._options?.fileSize ?? 1000000,
                files: this._options?.files ?? 1,
                headerPairs: this._options?.headerPairs ?? 2000,
                parts: this._options?.parts ?? 1000,
            },
        });
    }
}

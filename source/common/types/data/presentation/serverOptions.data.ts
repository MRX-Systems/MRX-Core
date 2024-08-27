import type { BasaltLogger } from '@basalt-lab/basalt-logger';

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

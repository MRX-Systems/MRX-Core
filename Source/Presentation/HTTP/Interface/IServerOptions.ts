/**
 * IServerOptions interface is responsible for defining the options for the server.
 */
export interface IServerOptions {

    /**
     * The base URL of the server. (Default: '/')
     */
    baseUrl?: string;

    /**
     * Enable HTTP/2.
     */
    http2?: boolean;

    /**
     * Enable logger.
     */
    logger?: boolean;
}
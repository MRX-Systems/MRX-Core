/**
 * The options for the CORS.
 */
export interface CorsOptions {
    /**
     * The origins for the CORS.
     */
    origins: string | string[];

    /**
     * Configures the Access-Control-Allow-Methods CORS header.
     * Expects a comma-delimited string (ex: 'GET,PUT,POST') or an array (ex: ['GET', 'PUT', 'POST']).
     */
    methods?: string | string[];

    /**
     * Credentials flag for the CORS.
     * Set to true to pass the header, otherwise it is omitted.
     */
    credentials?: boolean;
}

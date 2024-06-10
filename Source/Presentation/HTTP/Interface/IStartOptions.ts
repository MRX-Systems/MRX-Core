/**
 * IStartOptions interface is responsible for defining the options for starting the server.
 */
export interface IStartOptions {
    /**
     * The port number for the server.
     */
    port: number;

    /**
     * The host for the server.
     */
    host?: string;
}
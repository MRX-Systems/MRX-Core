/**
 * Interface for the Andesite API Config DTO
 */
export interface IAndesiteApiConfigDTO {
    /**
     * The type of the project.
     */
    ProjectType: string;
    /**
     * The configuration of the project.
     */
    Config: {
        /**
         * Activates the logger.
         */
        Logger: boolean;
        /**
         * The base source directory.
         */
        BaseSourceDir: string,
        /**
         * The entry point of the project.
         */
        EntryPoint: string;
        /**
         * The output directory of the project.
         */
        OutputDir: string;
        /**
         * The path alias of the project.
         */
        PathAlias: string;
    };
    /**
     * The dependencies of the project.
     */
    Infrastructure: Record<string, unknown>;
    /**
     * The server configuration of the project.
     */
    Server: {
        /**
         * The host of the server.
         */
        Host: string;
        /**
         * The port of the server.
         */
        Port: number;
        /**
         * The base URL of the server.
         */
        BaseUrl: string;
        /**
         * The security configuration of the server.
         */
        Security: {
            /**
             * The allowed IPs of the server.
             */
            AllowedIPs: string[] | string;
            /**
             * The blocked IPs of the server.
             */
            BlockedIPs: string[] | string;
            /**
             * The allowed origins of the server.
             */
            AllowedOrigins: string[] | string;
        };
    };
}

/**
 * Interface for the Andesite Worker Manager Config DTO
 */
export interface IAndesiteWorkerManagerConfigDTO {
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
}
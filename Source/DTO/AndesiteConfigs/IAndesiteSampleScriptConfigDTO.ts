/**
 * Interface for the Andesite Sample Script Config DTO
 */
export interface IAndesiteSampleScriptConfigDTO {
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
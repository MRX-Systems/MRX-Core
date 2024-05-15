/**
 * Build project options
 */
export interface IBuildProjectOptionsDTO {
    /**
     * Build the project in watch mode
     */
    watch: boolean;
    /**
     * Build the project in development mode
     */
    dev: boolean;
    /**
     * Minify the project (source: https://esbuild.github.io/api/#minify)
     */
    minify: boolean;
    /**
     * Keep names (source: https://esbuild.github.io/api/#keep-names)
     */
    keepNames: boolean;
    /**
     * Tree shaking (source: https://esbuild.github.io/api/#tree-shaking)
     */
    treeShaking: boolean;
}
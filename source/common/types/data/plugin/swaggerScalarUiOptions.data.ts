/**
 * The options for the SwaggerScalarUi plugin.
 */
export interface SwaggerScalarUiPluginOptions {
    /**
     * The path of the SwaggerScalarUi. (Default: '/swagger')
     */
    path?: string;
    /**
     * The theme of the SwaggerScalarUi. (Default: 'default')
     */
    theme?: 'default' | 'alternate' | 'moon' | 'purple' | 'solarized' | 'bluePlanet' | 'saturn' | 'kepler' | 'mars' | 'deepSpace';

    /**
     * The meta data for the SwaggerScalarUi.
     */
    metaData?: {
        /**
         * The title of the SwaggerScalarUi.
         */
        title?: string,
        /**
         * The description of the SwaggerScalarUi.
         */
        description?: string,
        /**
         * Other meta data for the SwaggerScalarUi.
         */
        [key: string]: string,
    };

    /**
     * The custom CSS for the SwaggerScalarUi.
     */
    customCss?: string;

    /**
     * The custom key used with CTRL/CMD to open the search modal
     */
    searchHotKey?: string;

    /**
     * Fav icon for the SwaggerScalarUi
     */
    favIcon?: string;
}

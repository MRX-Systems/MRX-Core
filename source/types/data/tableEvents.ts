/**
 * Represents event data structure for table operations.
 *
 * @template TModel - The data model type for the table items
 */
export interface TableEvents<TModel> {
    /**
     * Currently selected row(s) in the table {@link TModel}
     */
    selected: TModel | TModel[];
    /**
     * Array of newly created records {@link TModel}
     */
    created: TModel[];
    /**
     * Array of modified records {@link TModel}
     */
    updated: TModel[];
    /**
     * Array of removed records {@link TModel}
     */
    deleted: TModel[];
}
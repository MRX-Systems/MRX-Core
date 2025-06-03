import type { TObject } from '@sinclair/typebox';

export interface AdvancedSearchOptions<
    TSchemaName extends string,
    TInferedObject extends TObject
> {
    /**
     * The name of the schema to be used for advanced search.
     */
    schemaName: TSchemaName;
    /**
     * The base schema that defines the structure of the advanced search options.
     */
    baseSchema: TInferedObject;
    /**
     * Additional properties that should be excluded from the advanced search.
     */
    additionalExcludedProps?: string[];
}
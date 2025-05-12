import type { WhereClause } from './whereClause';
import type { SelectedFields } from './selectedFields';

/**
* Defines a full-text search parameter for advanced queries.
*
* @template TModel - The model type for which the search is constructed.
*/
export interface QueryPart<TModel> {
    /**
    * Full-text search parameter.
    * - string or number: simple full-text search on all fields
    * - object: targeted search on specific fields
    */
    $q?: string | number | {
        /** The fields to target for the full-text search. */
        selectedFields: SelectedFields<TModel>
        /** The value to search within the selected fields. */
        value: string | number
    }
}

/**
* Maps each field of TModel to either a direct match or a {@link WhereClause} filter.
*
* @template TModel - The type of the model whose fields are queried.
*/
export type ModelFieldsPart<TModel> = {
    /** Field-specific filters or direct value matching. */
    [K in keyof TModel]?: TModel[K] | Partial<WhereClause>
};

/**
* Allows additional arbitrary fields for searching with primitive values or {@link WhereClause} filters.
*/
export type ExtraFieldsPart = Record<
    string,
    string | number | boolean | Date | Partial<WhereClause> | undefined
>;

/**
* Comprehensive specification for advanced searches, combining:
* - QueryPart: full-text search options
* - ModelFieldsPart: field-specific filters
* - ExtraFieldsPart: arbitrary additional filters
*
* @template TModel - The model type to build the search against.
*
* @example
* ```typescript
* interface User {
*   id: number
*   name: string
* }
* const example: AdvancedSearch<User> = {
*   $q: { selectedFields: ['name'], value: 'John' },
*   id: 1,
*   name: { $eq: 'John' },
*   extraField: 'extraValue',
* }
* ```
*/
export type AdvancedSearch<TModel> = QueryPart<TModel>
    & ModelFieldsPart<TModel>
    & ExtraFieldsPart;

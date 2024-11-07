import type { WhereClause } from './data/index.ts';

export type * from './data/index.ts';
export * from './dependency/index.ts';

/**
 * An object containing the values to interpolate into the translated string.
 */
export type Interpolation = Record<string, unknown>;


/**
 * Defines a search model using either plain partials of the model T or a where clause filter for more dynamic querying.
 */
export type SearchModel<T> = {
    [P in keyof T]?: T[P] | Partial<WhereClause>;
} & Record<string, string | number | boolean | Date | Partial<WhereClause>>;


/**
 * Represents a simpler, optional model where any or all properties of T can be undefined, useful for optional query parameters.
 */
export type OptionalModel<T> = Partial<T>;

/**
 * Defines which columns to select in a query, with each key in T optionally mapped to a boolean or a specific transformation or alias as a string.
 */
export type ColumnsSelection<T> = Partial<Record<keyof T, boolean | string>>;

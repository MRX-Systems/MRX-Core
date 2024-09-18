import type { WhereClause } from './data/index.js';

export * from './data/index.js';
export * from './dependency/index.js';

/**
 * An object containing string values.
 */
export type ObjectString = Record<string, string>;
/**
 * An object containing unknown values.
 */
export type ObjectUnknown = Record<string, unknown>;
/**
 * An object containing the values to interpolate into the translated string.
 */
export type Interpolation = ObjectUnknown;

/**
 * Represents a type for filtering or searching within queries. Each property can use a subset of available filter operations.
 */
export type WhereClauseFilter<T> = Partial<Record<keyof T, Partial<WhereClause>>>;

/**
 * Defines a search model using either plain partials of the model T or a where clause filter for more dynamic querying.
 */
export type SearchModel<T> = Partial<T & Record<string, unknown>> | WhereClauseFilter<T & Record<string, unknown>>;

/**
 * Represents a simpler, optional model where any or all properties of T can be undefined, useful for optional query parameters.
 */
export type OptionalModel<T> = Partial<T>;

/**
 * Defines which columns to select in a query, with each key in T optionally mapped to a boolean or a specific transformation or alias as a string.
 */
export type ColumnsSelection<T> = Partial<Record<keyof T, boolean | string>>;

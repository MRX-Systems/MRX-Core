/**
 * Defines which columns to select in a query, with each key in T optionally mapped to a boolean or a specific transformation or alias as a string.
 */
export type ColumnsSelection<T> = Partial<Record<keyof T, boolean | string>>;

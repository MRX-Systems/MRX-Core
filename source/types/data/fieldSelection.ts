/**
 * Defines which columns to select in a query, with each key in T optionally mapped to a boolean or a specific transformation or alias as a string.
 *
 * @typeParam TModel - The type of the object to select fields from.
 *
 * @example
 * ```typescript
 * interface User {
 *     id: number;
 *     name: string;
 * }
 *
 * const selection: FieldSelection<User> = {
 *    id: true,
 * };
 * ```
 */
export type FieldSelection<TModel> = Partial<Record<keyof TModel, boolean | string>>;
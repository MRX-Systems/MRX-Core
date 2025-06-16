/**
 * Defines which columns to select in a query using an array of keys from the model type.
 *
 * @template TModel - The type of the object to select fields from.
 *
 * @example
 * ```ts
 * interface User {
 *     id: number;
 *     name: string;
 * }
 *
 * const selection: SelectedFields<User> = ['id', 'name'];
 * ```
 */
export type SelectedFields<TModel> = (keyof TModel extends string ? keyof TModel : never)[] | string[];

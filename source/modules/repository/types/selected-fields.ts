/**
 * Specifies the fields to select in a query for a given model type.
 *
 * This type allows you to define which columns should be included in the query result.
 * You can provide a single field name or an array of field names, using either keys from the model type or arbitrary strings.
 *
 * @template TModel - The type of the object to select fields from.
 *
 * @remarks
 * - If you use keys from the model type, TypeScript will provide type safety.
 * - You may also use string values for dynamic or computed fields.
 *
 * @example
 * Define a model
 * ```ts
 * interface User {
 *     id: number;
 *     name: string;
 * }
 * ```
 * @example
 * Select specific fields using model keys
 * ```ts
 * const selection1: SelectedFields<User> = ['id', 'name'];
 * ```
 * @example
 * Select a single field
 * ```ts
 * const selection2: SelectedFields<User> = 'id';
 * ```
 * @example
 * Select fields using arbitrary strings (e.g., computed columns)
 * ```ts
 * const selection3: SelectedFields<User> = ['id', 'fullName'];
 * ```
 */
export type SelectedFields<TModel>
= (keyof TModel extends string ? keyof TModel : string)
	| '*'
	| (keyof TModel extends string ? keyof TModel : string)[];

/**
 * Represents an ordering instruction for queries.
 *
 * This interface specifies the field to order by and the direction of the ordering.
 *
 * @template TModel - The type of the object to order by.
 *
 * @example
 * Define a model
 * ```ts
 * interface User {
 *   id: number;
 *   name: string;
 * }
 * ```
 * @example
 * Order by a single field ascending
 * ```ts
 * const orderBy1: OrderByItem<User> = {
 *   selectedField: 'id',
 *   direction: 'asc'
 * };
 * ```
 * @example
 * Order by a single field descending
 * ```ts
 * const orderBy2: OrderByItem<User> = {
 *   selectedField: 'name',
 *   direction: 'desc'
 * };
 * ```
 */
export interface OrderByItem<TModel> {
	/**
	 * The field to order by. Must be a key of the model or a string.
	 */
	selectedField: (keyof TModel extends string ? keyof TModel : string);
	/**
	 * The direction of the ordering: 'asc' for ascending, 'desc' for descending.
	 */
	direction: 'asc' | 'desc';
}

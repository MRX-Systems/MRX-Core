/**
 * Array of two elements, where the first element is the name of the field to order by and the second element is the order direction.
 *
 * @typeParam TModel - The type of the object to order by.
 *
 * @example
 * ```typescript
 * type User = {
 *    id: number;
 *   name: string;
 * };
 *
 * const orderBy: OrderBy<User> = ['id', 'asc'];
 * ```
 */
export type OrderBy<TModel> = [
    Extract<keyof TModel, string>,
    'asc' | 'desc'
];
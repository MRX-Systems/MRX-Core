/**
 * Represents an ordering instruction for queries.
 *
 * This tuple specifies the field to order by and the direction of the ordering.
 *
 * @template TModel - The type of the object to order by.
 *
 * @example
 * ```typescript
 * type User = {
 *   id: number;
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

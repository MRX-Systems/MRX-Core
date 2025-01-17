import type { WhereClause } from './whereClause';

/**
 * Defines an advanced search model using either plain partials of the model T or a {@link WhereClause} filter for more dynamic querying.
 *
 * @typeParam T - The model type to be used for the advanced search.
 *
 * @example
 * ```typescript
 * interface User {
 *    id: number;
 *   name: string;
 * }
 *
 * interface Basket {
 *   id: number;
 *   userId: number;
 *   products: Product[];
 * }
 *
 * const example1: AdvancedSearch<User> = {
 *     id: 1
 * };
 *
 * const example2: AdvancedSearch<User> = {
 *     name: {
 *         $eq: 'John'
 *     }
 * };
 *
 * const example3: AdvancedSearch<User> = {
 *    $q: 'John'
 * };
 *
 * const example4: AdvancedSearch<User & Basket> = {
 *   'basket.id': 1,
 * };
 * ```
 */
export type AdvancedSearch<T> = {
    [P in keyof T]?: T[P] | Partial<WhereClause>;
}
& Record<string, string | number | boolean | Date | Partial<WhereClause>>
& { $q?: string; };

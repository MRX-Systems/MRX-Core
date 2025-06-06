import type { WhereClause } from './whereClause';
import type { SelectedFields } from './selectedFields';

/**
 * Defines an advanced search model using either plain partials of the model T or a {@link WhereClause} filter for more dynamic querying.
 *
 * @template TModel - The model type to be used for the advanced search.
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
export type AdvancedSearch<TModel> = {
    $q?: string | number | {
        selectedFields: SelectedFields<TModel>,
        value: string | number
    };
} & {
    [Key in keyof TModel]?: TModel[Key] | Partial<WhereClause<TModel[Key]>>;
};
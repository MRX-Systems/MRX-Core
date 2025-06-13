import type { AdaptiveWhereClause } from './adaptiveWhereClause';
import type { SelectedFields } from './selectedFields';

/**
 * Defines an filter model using either plain partials of the model TModel or a {@link AdaptiveWhereClause} filter for more dynamic querying.
 *
 * @template TModel - The model type to be used for the filter.
 *
 * @example
 * ```ts
 * interface User {
 *    id: number;
 *    name: string;
 * }
 *
 * interface Basket {
 *   id: number;
 *   userId: number;
 *   products: Product[];
 * }
 *
 * const example1: Filter<User> = {
 *     id: 1
 * };
 *
 * const example2: Filter<User> = {
 *     name: {
 *         $eq: 'John'
 *     }
 * };
 *
 * const example3: Filter<User> = {
 *     $q: 'John'
 * };
 * ```
 */
export type Filter<TModel> = {
    $q?: string | number | {
        selectedFields: SelectedFields<TModel>,
        value: string | number
    };
} & {
    [Key in keyof TModel]?: TModel[Key] | Partial<AdaptiveWhereClause<TModel[Key]>>;
};
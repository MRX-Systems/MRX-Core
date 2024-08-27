/**
 * Interface Where clause, each key is a clause to use in the query
 */
export interface WhereClause {
    /**
     * In clause
     * @example
     * ```typescript
     * { id: { $in: ['1', '2'] } }
     * ```
     */
    $in: string[] | number[];
    /**
     * Not in clause
     * @example
     * ```typescript
     * { id: { $nin: ['1', '2'] } }
     * ```
     */
    $nin: string[] | number[];
    /**
     * Equal clause
     * @example
     * ```typescript
     * { id: { $eq: '1' } }
     * ```
     */
    $eq: string | number | boolean;
    /**
     * Not equal clause
     * @example
     * ```typescript
     * { id: { $neq: '1' } }
     * ```
     */
    $neq: string | number | boolean;
    /**
     * Like clause
     * @example
     * ```typescript
     * { id: { $match: '1' } }
     * ```
     */
    $match: string;
    /**
     * Less than
     * @example
     * ```typescript
     * { id: { $lt: '3' } }
     * ```
     */
    $lt: string | number;
    /**
     * Less than or equal
     * @example
     * ```typescript
     * { id: { $lte: '3' } }
     * ```
     */
    $lte: string | number;
    /**
     * Greater than
     * @example
     * ```typescript
     * { id: { $gt: '3' } }
     * ```
     */
    $gt: string | number;
    /**
     * Greater than or equal
     * @example
     * ```typescript
     * { id: { $gte: '3' } }
     * ```
     */
    $gte: string | number;
}

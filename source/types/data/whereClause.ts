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
    $in?: string[] | number[] | Date[];
    /**
     * Not in clause
     * @example
     * ```typescript
     * { id: { $nin: ['1', '2'] } }
     * ```
     */
    $nin?: string[] | number[] | Date[];
    /**
     * Equal clause
     * @example
     * ```typescript
     * { id: { $eq: '1' } }
     * ```
     */
    $eq?: string | number | boolean | Date;
    /**
     * Not equal clause
     * @example
     * ```typescript
     * { id: { $neq: '1' } }
     * ```
     */
    $neq?: string | number | boolean | Date;
    /**
     * Like clause
     * @example
     * ```typescript
     * { id: { $match: '1' } }
     * ```
     */
    $match?: string;
    /**
     * Less than
     * @example
     * ```typescript
     * { id: { $lt: '3' } }
     * ```
     */
    $lt?: string | number | Date;
    /**
     * Less than or equal
     * @example
     * ```typescript
     * { id: { $lte: '3' } }
     * ```
     */
    $lte?: string | number | Date;
    /**
     * Greater than
     * @example
     * ```typescript
     * { id: { $gt: '3' } }
     * ```
     */
    $gt?: string | number | Date;
    /**
     * Greater than or equal
     * @example
     * ```typescript
     * { id: { $gte: '3' } }
     * ```
     */
    $gte?: string | number | Date;
    /**
     * Not null
     * @example
     * ```typescript
     * { id: { $notNull: true } }
     * ```
     */
    $isNotNull: boolean;
    /**
     * Is null
     * @example
     * ```typescript
     * { id: { $isNull: true } }
     * ```
     */
    $isNull: boolean;
}
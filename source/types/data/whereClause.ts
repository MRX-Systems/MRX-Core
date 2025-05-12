/**
 * Represents a set of conditional clauses for filtering data in queries.
 *
 * Each property corresponds to a specific comparison or logical operation,
 * allowing for flexible and expressive query construction.
 */
export interface WhereClause {
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
     * Between clause
     * @example
     * ```typescript
     * { id: { $between: ['1', '2'] } }
     * ```
     */
    $between?: [string | number | Date, string | number | Date];

    /**
     * Not between clause
     * @example
     * ```typescript
     * { id: { $nbetween: ['1', '2'] } }
     * ```
     */
    $nbetween?: [string | number | Date, string | number | Date];

    /**
     * Like clause
     * @example
     * ```typescript
     * { id: { $like: '1' } }
     * ```
     */
    $like?: string;

    /**
     * Not like clause
     * @example
     * ```typescript
     * { id: { $nlike: '1' } }
     * ```
     */
    $nlike?: string;

    /**
     * Is null
     * @example
     * ```typescript
     * { id: { $isNull: true } }
     * ```
     */
    $isNull: boolean;
}

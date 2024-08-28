import type { Transaction } from '#/common/types/index.ts';

/**
 * Interface Option query
 */
export interface QueryOptions {
    /**
     * If the query does not return any result, throw an error
     */
    throwIfNoResult?: boolean;
    /**
     * If the query can throw an error
     */
    throwIfQueryError?: boolean;
    /**
     * If the query is a transaction ({@link Transaction})
     */
    transaction?: Transaction;
}

import type { QueryOptions } from './queryOptions';

/**
 * Interface Option query with stream option inherited from {@link QueryOptions}
 *
 * @typeParam T - The type of the object to retrieve.
 */
export interface QueryOptionsExtendStream<T> extends QueryOptions<T> {
    highWaterMark?: number;
}
import type { QueryOptions } from './queryOptions';

/**
 * Interface Option query with stream option inherited from {@link QueryOptions}
 *
 * @typeParam T - The type of the object to retrieve.
 */
export interface QueryOptionsExtendStream<T> extends QueryOptions<T> {
    /**
     * Transform the chunk before emitting it.
     *
     * @param chunk - The chunk to transform.
     * @param encoding - The encoding of the chunk.
     * @param callback - The callback to call when the transformation is complete.
     */
    transform?: (chunk: T, encoding: string, callback: (error?: Error | null, data?: T) => void) => void;
}
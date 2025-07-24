import type { QueryOptions } from './queryOptions';

/**
 * Interface Option query with stream option inherited from {@link QueryOptions}
 *
 * @template TModel - The type of the object to retrieve.
 */
export interface QueryOptionsExtendStream<TModel> extends QueryOptions<TModel> {
	/**
	 * Transform the chunk before emitting it.
	 *
	 * @param chunk - The chunk to transform.
	 * @param encoding - The encoding of the chunk.
	 * @param callback - The callback to call when the transformation is complete.
	 */
	readonly transform?: (chunk: NoInfer<TModel>, encoding: string, callback: (error?: Error | null, data?: NoInfer<TModel>) => void) => void;
}
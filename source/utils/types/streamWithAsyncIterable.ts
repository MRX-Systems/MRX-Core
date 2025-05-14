import type { PassThrough } from 'stream';

/**
 * A stream with an async iterable interface. ({@link PassThrough} & {@link AsyncIterable})
 *
 * This type enables both stream-based and async iteration access to the same data source.
 *
 * @template TModel - The type of the object to retrieve.
 *
 * @example
 * ```typescript
 * interface User {
 *     id: string;
 *     name: string;
 * }
 *
 * const users: StreamWithAsyncIterable<User> = ...;
 *
 * // Method 1
 * for await (const user of users)
 *    console.log(user);
 *
 * // Method 2
 * users.on('data', (user: User) => console.log(user));
 * ```
 */
export type StreamWithAsyncIterable<TModel> = PassThrough & AsyncIterable<TModel extends (infer Model)[] ? Model : never>;
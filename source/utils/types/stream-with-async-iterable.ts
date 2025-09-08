import type { PassThrough } from 'stream';

/**
 * A stream with an async iterable interface. ({@link PassThrough} & {@link AsyncIterable})
 *
 * This type enables both stream-based and async iteration access to the same data source.
 *
 * @template TModel - The type of the object to retrieve.
 *
 * @example
 *  Define a model
 * ```ts
 * interface User {
 *     id: string;
 *     name: string;
 * }
 * ```
 * @example
 * Use the stream with async iterable
 * ```ts
 * const users: StreamWithAsyncIterable<User> = ...;
 *
 * for await (const user of users)
 *    console.log(user);
 *```
 * @example
 * Use the stream with event listeners
 * ```ts
 * const users: StreamWithAsyncIterable<User> = ...;
 *
 * users.on('data', (user: User) => console.log(user));
 * ```
 */
export type StreamWithAsyncIterable<TModel> = AsyncIterable<TModel> & PassThrough;
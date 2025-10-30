export interface KvStore {
	/**
	 * Connect to the store.
	 */
	connect?(): Promise<void> | void;

	/**
	 * Close the connection to the store.
	 */
	close?(): Promise<void> | void;

	/**
	 * Get the value associated with a key.
	 *
	 * @template T - The type of the value to retrieve.
	 *
	 * @param key - The key to retrieve the value for.
	 *
	 * @returns The value associated with the key, or `null` if the key does not exist.
	 */
	get<T = unknown>(key: string): T | null | Promise<T | null>;

	/**
	 * Set the value associated with a key.
	 *
	 * @template T - The type of the value to set.
	 *
	 * @param key - The key to set the value for.
	 * @param value - The value to set.
	 * @param ttlSec - The time-to-live for the key, in seconds.
	 */
	set<T = unknown>(key: string, value: T, ttlSec?: number): void | Promise<void>;

	/**
	 * Increment the value associated with a key.
	 * Value needs to be a number.
	 *
	 * @param key - The key to increment the value for.
	 * @param amount - The amount to increment by.
	 *
	 * @returns The new value after incrementing.
	 */
	increment(key: string, amount?: number): number | Promise<number>;

	/**
	 * Decrement the value associated with a key.
	 * Value needs to be a number.
	 *
	 * @param key - The key to decrement the value for.
	 * @param amount - The amount to decrement by.
	 *
	 * @returns The new value after decrementing.
	 */
	decrement(key: string, amount?: number): number | Promise<number>;

	/**
	 * Delete a key from the store.
	 *
	 * @param key - The key to delete.
	 *
	 * @returns `true` if the key was deleted, `false` otherwise.
	 */
	del(key: string): boolean | Promise<boolean>;

	/**
	 * Set the expiration time for a key.
	 *
	 * @param key - The key to set the expiration for.
	 * @param ttlSec - The time-to-live for the key, in seconds.
	 *
	 * @returns `true` if the expiration was set, `false` otherwise.
	 */
	expire(key: string, ttlSec: number): boolean | Promise<boolean>;

	/**
	 * Get the remaining time-to-live for a key.
	 *
	 * @param key - The key to retrieve the TTL for.
	 *
	 * @returns The remaining time-to-live for the key, in seconds.
	 */
	ttl(key: string): number | Promise<number>;

	/**
	 * Clean all keys from the store.
	 *
	 * @returns The number of keys that were removed.
	 */
	clean(): number | Promise<number>;
}
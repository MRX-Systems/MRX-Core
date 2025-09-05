
import { Redis, type RedisOptions } from 'ioredis';

import { BaseError } from '#/errors/base-error';
import { KV_STORE_ERROR_KEYS } from '#/modules/kv-store/enums/kv-store-error-keys';
import type { KvStore } from '#/modules/kv-store/types/kv-store';

/**
 * Redis-based key-value store implementation using ioredis client.
 *
 * Provides a Redis-backed implementation of the KvStore interface with
 * automatic JSON serialization/deserialization and proper error handling.
 */
export class IoRedisStore implements KvStore {
	/**
	 * Redis client instance.
	 */
	private readonly _client: Redis;

	/**
	 * Creates an IoRedis store instance.
	 *
	 * @param options - Redis connection options
	 */
	public constructor(options: RedisOptions) {
		this._client = new Redis({
			...options,
			lazyConnect: true
		});
	}

	/**
	 * Establishes connection to Redis server.
	 *
	 * @throws ({@link BaseError}) - When connection fails
	 */
	public async connect(): Promise<void> {
		try {
			await this._client.connect();
		} catch (e) {
			throw new BaseError(KV_STORE_ERROR_KEYS.CONNECTION_FAILED, e);
		}
	}

	/**
	 * Closes the Redis connection gracefully.
	 *
	 * @throws ({@link BaseError}) - When closing connection fails
	 */
	public async close(): Promise<void> {
		try {
			await this._client.quit();
		} catch (e) {
			throw new BaseError(KV_STORE_ERROR_KEYS.CLOSING_CONNECTION_FAILED, e);
		}
	}

	/**
	 * Retrieves a value from Redis by key.
	 *
	 * @template T - The expected type of the stored value
	 *
	 * @param key - The key to retrieve
	 *
	 * @returns The value associated with the key, or null if not found or expired
	 */
	public async get<T = unknown>(key: string): Promise<T | null> {
		const value = await this._client.get(key);
		if (value === null)
			return null;

		try {
			return JSON.parse(value) as T;
		} catch {
			// If it's not JSON, return as string (Redis behavior)
			return value as T;
		}
	}

	/**
	 * Stores a value in Redis with optional TTL.
	 *
	 * @template T - The type of the value being stored
	 *
	 * @param key - The key to store the value under
	 * @param value - The value to store
	 * @param ttlSec - Time to live in seconds (optional)
	 */
	public async set<T = unknown>(key: string, value: T, ttlSec?: number): Promise<void> {
		const serialized = typeof value === 'string'
			? value
			: JSON.stringify(value);

		if (ttlSec)
			await this._client.setex(key, ttlSec, serialized);
		else
			await this._client.set(key, serialized);
	}

	/**
	 * Increments a numeric value stored at key by the specified amount.
	 * If the key does not exist, it is set to 0 before performing the operation.
	 *
	 * @param key - The key containing the numeric value
	 * @param amount - The amount to increment by (default: 1)
	 *
	 * @throws ({@link BaseError}) - When the value is not a valid integer
	 *
	 * @returns The value after incrementing
	 */
	public async increment(key: string, amount = 1): Promise<number> {
		// Check if key exists and validate it's a number
		const current = await this._client.get(key);
		if (current !== null) {
			const parsed = Number(current);
			if (Number.isNaN(parsed))
				throw new BaseError(KV_STORE_ERROR_KEYS.NOT_INTEGER);
		}

		if (amount === 1)
			return this._client.incr(key);

		return this._client.incrby(key, amount);
	}

	/**
	 * Decrements a numeric value stored at key by the specified amount.
	 * If the key does not exist, it is set to 0 before performing the operation.
	 *
	 * @param key - The key containing the numeric value
	 * @param amount - The amount to decrement by (default: 1)
	 *
	 * @throws ({@link BaseError}) - When the value is not a valid integer
	 *
	 * @returns The value after decrementing
	 */
	public async decrement(key: string, amount = 1): Promise<number> {
		// Check if key exists and validate it's a number
		const current = await this._client.get(key);
		if (current !== null) {
			const parsed = Number(current);
			if (Number.isNaN(parsed))
				throw new BaseError(KV_STORE_ERROR_KEYS.NOT_INTEGER);
		}

		if (amount === 1)
			return this._client.decr(key);

		return this._client.decrby(key, amount);
	}

	/**
	 * Deletes a key from Redis.
	 *
	 * @param key - The key to delete
	 *
	 * @returns True if the key was deleted, false if it did not exist
	 */
	public async del(key: string): Promise<boolean> {
		const result = await this._client.del(key);
		return result === 1;
	}

	/**
	 * Sets an expiration time for a key.
	 *
	 * @param key - The key to set expiration for
	 * @param ttlSec - Time to live in seconds
	 *
	 * @returns True if the expiration was set, false if the key does not exist
	 */
	public async expire(key: string, ttlSec: number): Promise<boolean> {
		const result = await this._client.expire(key, ttlSec);
		return result === 1;
	}

	/**
	 * Gets the remaining time to live for a key.
	 *
	 * @param key - The key to check
	 *
	 * @returns Time to live in seconds, -1 if key has no expiration, -2 if key does not exist
	 */
	public ttl(key: string): Promise<number> {
		return this._client.ttl(key);
	}

	/**
	 * Removes all keys from the Redis database.
	 *
	 * @returns The number of keys that were deleted
	 */
	public async clean(): Promise<number> {
		const keys = await this._client.keys('*');
		if (keys.length === 0)
			return 0;
		return this._client.del(...keys);
	}
}

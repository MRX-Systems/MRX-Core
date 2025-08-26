import { BaseError } from '#/errors/baseError';
import { KV_STORE_ERROR_KEYS } from '#/modules/kvStore/enums/kvStoreErrorKeys';
import type { KvStore } from '#/modules/kvStore/types/kvStore';
import type { MemoryStoreEntry } from './types/memoryStoreEntry';

/**
 * In-memory key-value store implementation with automatic cleanup of expired entries.
 *
 * Provides a memory-based implementation of the KvStore interface with TTL support
 * and automatic background cleanup of expired entries.
 */
export class MemoryStore implements KvStore {
	/**
	 * In-memory key-value store.
	 */
	private readonly _store = new Map<string, MemoryStoreEntry>();

	/**
	 * Cleanup interval (5 minutes by default).
	 *
	 * @defaultValue 300000
	 */
	private readonly _cleanupInterval: number;

	/**
	 * Timer for cleanup operations.
	 */
	private _cleanupTimer: Timer | null = null;

	/**
	 * Creates instance and starts cleanup process.
	 *
	 * @param cleanupIntervalMs - Cleanup interval in milliseconds (default: 300000 ms / 5 minutes)
	 */
	public constructor(cleanupIntervalMs?: number) {
		this._cleanupInterval = cleanupIntervalMs ?? 300000;
		this._startCleanup();
	}

	/**
	 * Retrieves a value from the store by key.
	 * Automatically removes expired entries during retrieval.
	 *
	 * @template T - The expected type of the stored value
	 *
	 * @param key - The key to retrieve
	 *
	 * @returns The value associated with the key, or null if not found or expired
	 */
	public get<T = unknown>(key: string): T | null {
		const entry = this._store.get(key);

		if (!entry)
			return null;

		const now = Date.now();
		if (now > entry.expiresAt && entry.expiresAt !== -1) {
			this._store.delete(key);
			return null;
		}

		return entry.value as T;
	}

	/**
	 * Stores a value in memory with optional TTL.
	 *
	 * @template T - The type of the value being stored
	 *
	 * @param key - The key to store the value under
	 * @param value - The value to store
	 * @param ttlSec - Time to live in seconds (optional)
	 */
	public set<T = unknown>(key: string, value: T, ttlSec?: number): void {
		const expiresAt = ttlSec
			? Date.now() + (ttlSec * 1000)
			: -1;
		this._store.set(key, { value, expiresAt });
	}

	/**
	 * Increments a numeric value stored at key by the specified amount.
	 * If the key does not exist, it is set to 0 before performing the operation.
	 * Preserves existing TTL when incrementing.
	 *
	 * @param key - The key containing the numeric value
	 * @param amount - The amount to increment by (default: 1)
	 *
	 * @throws ({@link BaseError}) - When the value is not a valid integer
	 *
	 * @returns The value after incrementing
	 */
	public increment(key: string, amount = 1): number {
		// Use get() to handle expiration automatically
		const current = this.get<number>(key);
		const entry = this._store.get(key);

		// If key exists, validate it's a number (like Redis behavior)
		if (current !== null && typeof current !== 'number')
			throw new BaseError({
				message: KV_STORE_ERROR_KEYS.NOT_INTEGER
			});

		const currentValue = current ?? 0;
		const newValue = currentValue + amount;

		// Preserve existing TTL or set no expiration for new keys
		const expiresAt = entry ? entry.expiresAt : -1;
		this._store.set(key, { value: newValue, expiresAt });

		return newValue;
	}

	/**
	 * Decrements a numeric value stored at key by the specified amount.
	 * If the key does not exist, it is set to 0 before performing the operation.
	 * Preserves existing TTL when decrementing.
	 *
	 * @param key - The key containing the numeric value
	 * @param amount - The amount to decrement by (default: 1)
	 *
	 * @throws ({@link BaseError}) - When the value is not a valid integer
	 *
	 * @returns The value after decrementing
	 */
	public decrement(key: string, amount = 1): number {
		// Use get() to handle expiration automatically
		const current = this.get<number>(key);
		const entry = this._store.get(key);

		// If key exists, validate it's a number (like Redis behavior)
		if (current !== null && typeof current !== 'number')
			throw new BaseError({
				message: KV_STORE_ERROR_KEYS.NOT_INTEGER
			});

		const currentValue = current ?? 0;
		const newValue = currentValue - amount;

		// Preserve existing TTL or set no expiration for new keys
		const expiresAt = entry ? entry.expiresAt : -1;
		this._store.set(key, { value: newValue, expiresAt });

		return newValue;
	}

	/**
	 * Deletes a key from the store.
	 *
	 * @param key - The key to delete
	 *
	 * @returns True if the key was deleted, false if it did not exist
	 */
	public del(key: string): boolean {
		return this._store.delete(key);
	}

	/**
	 * Sets an expiration time for a key.
	 *
	 * @param key - The key to set expiration for
	 * @param ttlSec - Time to live in seconds
	 *
	 * @returns True if the expiration was set, false if the key does not exist
	 */
	public expire(key: string, ttlSec: number): boolean {
		const entry = this._store.get(key);
		if (!entry)
			return false;

		entry.expiresAt = Date.now() + (ttlSec * 1000);
		return true;
	}

	/**
	 * Gets the remaining time to live for a key.
	 *
	 * @param key - The key to check
	 *
	 * @returns Time to live in seconds, -1 if key has no expiration or does not exist
	 */
	public ttl(key: string): number {
		const entry = this._store.get(key);
		if (!entry)
			return -1;

		if (entry.expiresAt === -1)
			return -1;

		const remaining = entry.expiresAt - Date.now();
		return remaining > 0 ? Math.ceil(remaining / 1000) : -1;
	}

	/**
	 * Removes all keys from the store.
	 *
	 * @returns The number of keys that were deleted
	 */
	public clean(): number {
		const sizeBefore = this._store.size;
		this._store.clear();
		return sizeBefore;
	}

	/**
	 * Starts the cleanup process for expired entries.
	 */
	private _startCleanup(): void {
		if (this._cleanupTimer)
			return;

		this._cleanupTimer = setInterval(() => {
			this._removeExpiredEntries();
		}, this._cleanupInterval);
	}

	/**
	 * Removes expired entries from the store.
	 */
	private _removeExpiredEntries(): void {
		const now = Date.now();

		for (const [key, entry] of this._store.entries())
			if (entry.expiresAt !== -1 && now > entry.expiresAt)
				this._store.delete(key);
	}

	/**
	 * Stops the cleanup process and clears resources.
	 */
	public destroy(): void {
		if (this._cleanupTimer) {
			clearInterval(this._cleanupTimer);
			this._cleanupTimer = null;
		}
		this._store.clear();
	}
}
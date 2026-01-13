import { InternalError } from '#/errors/internal-error';
import { KV_STORE_ERROR_KEYS } from '#/modules/kv-store/enums/kv-store-error-keys';
import type { KvStore } from '#/modules/kv-store/types/kv-store';
import type { MemoryStoreEntry } from './types/memory-store-entry';

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
	 * Maximum number of entries allowed in the store.
	 * Defaults to Infinity (no limit).
	 */
	private readonly _maxSize: number;

	/**
	 * Timer for cleanup operations.
	 */
	private _cleanupTimer: Timer | null = null;

	public constructor(cleanupIntervalMs?: number, maxSize?: number) {
		this._cleanupInterval = cleanupIntervalMs ?? 300000;
		this._maxSize = maxSize ?? Infinity;
		this._startCleanup();
	}

	public get<T = unknown>(key: string): T | null {
		this._validateKey(key);

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

	public set<T = unknown>(key: string, value: T, ttlSec?: number): void {
		this._validateKey(key);
		this._validateTtl(ttlSec);

		if (this._store.size >= this._maxSize && !this._store.has(key))
			throw new InternalError(KV_STORE_ERROR_KEYS.STORE_FULL);

		const expiresAt = ttlSec
			? Date.now() + (ttlSec * 1000)
			: -1;
		this._store.set(key, { value, expiresAt });
	}

	public increment(key: string, amount = 1): number {
		this._validateKey(key);
		this._validateAmount(amount);

		const entry = this._store.get(key);
		const now = Date.now();

		let currentValue = 0;
		let expiresAt = -1;

		if (entry)
			if (entry.expiresAt !== -1 && now > entry.expiresAt) {
				this._store.delete(key);
			} else {
				if (entry.value !== null && typeof entry.value !== 'number')
					throw new InternalError(KV_STORE_ERROR_KEYS.NOT_INTEGER);
				currentValue = (entry.value as number) ?? 0;
				({ expiresAt } = entry);
			}


		const newValue = currentValue + amount;
		this._store.set(key, { value: newValue, expiresAt });
		return newValue;
	}

	public decrement(key: string, amount = 1): number {
		this._validateKey(key);
		this._validateAmount(amount);

		const entry = this._store.get(key);
		const now = Date.now();

		let currentValue = 0;
		let expiresAt = -1;

		if (entry)
			if (entry.expiresAt !== -1 && now > entry.expiresAt) {
				this._store.delete(key);
			} else {
				if (entry.value !== null && typeof entry.value !== 'number')
					throw new InternalError(KV_STORE_ERROR_KEYS.NOT_INTEGER);
				currentValue = (entry.value as number) ?? 0;
				({ expiresAt } = entry);
			}


		const newValue = currentValue - amount;
		this._store.set(key, { value: newValue, expiresAt });
		return newValue;
	}

	public del(key: string): boolean {
		this._validateKey(key);

		return this._store.delete(key);
	}

	public expire(key: string, ttlSec: number): boolean {
		this._validateKey(key);
		this._validateTtl(ttlSec);

		const entry = this._store.get(key);
		if (!entry)
			return false;

		entry.expiresAt = Date.now() + (ttlSec * 1000);
		return true;
	}

	public ttl(key: string): number {
		this._validateKey(key);

		const entry = this._store.get(key);
		if (!entry)
			return -1;

		if (entry.expiresAt === -1)
			return -1;

		const remaining = entry.expiresAt - Date.now();
		return remaining > 0 ? Math.ceil(remaining / 1000) : -1;
	}

	public clean(): number {
		const sizeBefore = this._store.size;
		this._store.clear();
		return sizeBefore;
	}

	private _startCleanup(): void {
		if (this._cleanupTimer)
			return;

		this._cleanupTimer = setInterval(() => {
			this._removeExpiredEntries();
		}, this._cleanupInterval);

		// Allow process to exit even if timer is running
		this._cleanupTimer.unref();
	}

	private _removeExpiredEntries(): void {
		const now = Date.now();

		for (const [key, entry] of this._store.entries())
			if (entry.expiresAt !== -1 && now > entry.expiresAt)
				this._store.delete(key);
	}

	public destroy(): void {
		if (this._cleanupTimer) {
			clearInterval(this._cleanupTimer);
			this._cleanupTimer = null;
		}
		this._store.clear();
	}

	/**
	 * Validates that a key is a non-empty string with reasonable length.
	 *
	 * @param key - The key to validate.
	 *
	 * @throws ({@link InternalError}) – If the key is invalid.
	 */
	private _validateKey(key: string): void {
		if (!key || typeof key !== 'string' || key.length > 1024 || key.includes('\0'))
			throw new InternalError(KV_STORE_ERROR_KEYS.INVALID_KEY);
	}

	/**
	 * Validates that a TTL value is a positive finite integer.
	 *
	 * @param ttlSec - The TTL value to validate.
	 *
	 * @throws ({@link InternalError}) – If the TTL is invalid.
	 */
	private _validateTtl(ttlSec: number | undefined): void {
		if (ttlSec === undefined)
			return;

		if (!Number.isFinite(ttlSec) || ttlSec <= 0 || !Number.isInteger(ttlSec))
			throw new InternalError(KV_STORE_ERROR_KEYS.INVALID_TTL);
	}

	/**
	 * Validates that an increment/decrement amount is a finite integer.
	 *
	 * @param amount - The amount to validate.
	 *
	 * @throws ({@link InternalError}) – If the amount is invalid.
	 */
	private _validateAmount(amount: number): void {
		if (!Number.isFinite(amount) || !Number.isInteger(amount))
			throw new InternalError(KV_STORE_ERROR_KEYS.INVALID_AMOUNT);
	}
}
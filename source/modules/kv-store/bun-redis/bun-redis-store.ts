import { RedisClient, type RedisOptions } from 'bun';

import { InternalError } from '#/errors/internal-error';
import { KV_STORE_ERROR_KEYS } from '#/modules/kv-store/enums/kv-store-error-keys';
import type { KvStore } from '#/modules/kv-store/types/kv-store';

/**
 * Redis-based key-value store implementation using Bun's Redis client.
 *
 * Provides a Redis-backed implementation of the KvStore interface with
 * automatic JSON serialization/deserialization and proper error handling.
 */
export class BunRedisStore implements KvStore {
	/**
	 * Redis client instance.
	 */
	private readonly _client: RedisClient;

	public constructor(url?: string, options?: RedisOptions) {
		this._client = new RedisClient(url, options);
	}

	public async connect(): Promise<void> {
		try {
			await this._client.connect();
		} catch (e) {
			throw new InternalError(KV_STORE_ERROR_KEYS.CONNECTION_FAILED, e);
		}
	}

	public close?(): void {
		try {
			this._client.close();
		} catch (e) {
			throw new InternalError(KV_STORE_ERROR_KEYS.CLOSING_CONNECTION_FAILED, e);
		}
	}

	public async get<T = unknown>(key: string): Promise<T | null> {
		this._validateKey(key);

		const value = await this._client.get(key);
		if (value === null)
			return null;

		try {
			const parsed: unknown = JSON.parse(value);
			return this._sanitizePrototype(parsed) as T;
		} catch {
			return value as T;
		}
	}

	public async set<T = unknown>(key: string, value: T, ttlSec?: number): Promise<void> {
		this._validateKey(key);
		this._validateTtl(ttlSec);

		const serialized = typeof value === 'string'
			? value
			: JSON.stringify(value);

		if (ttlSec)
			await this._client.set(key, serialized, 'EX', ttlSec);
		else
			await this._client.set(key, serialized);
	}

	public async increment(key: string, amount = 1): Promise<number> {
		this._validateKey(key);
		this._validateAmount(amount);

		try {
			const number = await this._client.incrby(key, amount);
			return number;
		} catch (e) {
			throw new InternalError(KV_STORE_ERROR_KEYS.NOT_INTEGER, e);
		}
	}

	public async decrement(key: string, amount = 1): Promise<number> {
		this._validateKey(key);
		this._validateAmount(amount);

		try {
			const number = await this._client.decrby(key, amount);
			return number;
		} catch (e) {
			throw new InternalError(KV_STORE_ERROR_KEYS.NOT_INTEGER, e);
		}
	}

	public async del(key: string): Promise<boolean> {
		this._validateKey(key);

		const res = await this._client.del(key);
		return res === 1;
	}

	public async expire(key: string, ttlSec: number): Promise<boolean> {
		this._validateKey(key);
		this._validateTtl(ttlSec);

		const res = await this._client.expire(key, ttlSec);
		return res === 1;
	}

	public async ttl(key: string): Promise<number> {
		this._validateKey(key);

		const res = await this._client.ttl(key);
		return res;
	}

	public async clean(): Promise<number> {
		let cursor = '0';
		let deletedCount = 0;

		do {
			const [nextCursor, keys] = await this._client.send('SCAN', [cursor, 'COUNT', '100']) as [string, string[]];
			cursor = nextCursor;

			if (keys.length > 0)
				deletedCount += await this._client.del(...keys);
		} while (cursor !== '0');

		return deletedCount;
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

	/**
	 * Sanitizes parsed JSON to prevent prototype pollution attacks.
	 *
	 * @param value - The parsed value to sanitize.
	 *
	 * @returns The sanitized value.
	 */
	private _sanitizePrototype<T>(value: T): T {
		if (value !== null && typeof value === 'object') {
			delete (value as Record<string, unknown>)['__proto__'];
			delete (value as Record<string, unknown>)['constructor'];
			delete (value as Record<string, unknown>)['prototype'];
		}
		return value;
	}
}
import { Redis, type RedisOptions } from 'ioredis';

import { InternalError } from '#/errors/internal-error';
import { KV_STORE_ERROR_KEYS } from '#/modules/kv-store/enums/kv-store-error-keys';
import type { KvStore } from '#/modules/kv-store/types/kv-store';
import { sanitizeJsonValue } from '#/modules/kv-store/utils/sanitize-json-value';
import {
	validateAmount,
	validateKey,
	validateTtl
} from '#/modules/kv-store/utils/validate-kv-params';

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

	public constructor(options: RedisOptions) {
		this._client = new Redis({
			...options,
			lazyConnect: true
		});
	}

	public async connect(): Promise<void> {
		try {
			await this._client.connect();
		} catch (e) {
			throw new InternalError(KV_STORE_ERROR_KEYS.CONNECTION_FAILED, e);
		}
	}

	public async close(): Promise<void> {
		try {
			await this._client.quit();
		} catch (e) {
			throw new InternalError(KV_STORE_ERROR_KEYS.CLOSING_CONNECTION_FAILED, e);
		}
	}

	public async get<T = unknown>(key: string): Promise<T | null> {
		validateKey(key);

		const value = await this._client.get(key);
		if (value === null) return null;

		try {
			const parsed: unknown = JSON.parse(value);
			return sanitizeJsonValue(parsed) as T;
		} catch {
			return value as T;
		}
	}

	public async set<T = unknown>(key: string, value: T, ttlSec?: number): Promise<void> {
		validateKey(key);
		validateTtl(ttlSec);

		const serialized = typeof value === 'string' ? value : JSON.stringify(value);

		if (ttlSec) await this._client.setex(key, ttlSec, serialized);
		else await this._client.set(key, serialized);
	}

	public increment(key: string, amount = 1): Promise<number> {
		return this._adjustBy(key, amount);
	}

	public decrement(key: string, amount = 1): Promise<number> {
		return this._adjustBy(key, -amount);
	}

	public async del(key: string): Promise<boolean> {
		validateKey(key);

		const result = await this._client.del(key);
		return result === 1;
	}

	public async expire(key: string, ttlSec: number): Promise<boolean> {
		validateKey(key);
		validateTtl(ttlSec);

		const result = await this._client.expire(key, ttlSec);
		return result === 1;
	}

	public ttl(key: string): Promise<number> {
		validateKey(key);

		return this._client.ttl(key);
	}

	public async clean(): Promise<number> {
		let cursor = '0';
		let deletedCount = 0;

		while (true) {
			// oxlint-disable eslint-disable-next-line no-await-in-loop -- Redis SCAN requires sequential cursor iteration
			const [nextCursor, keys] = await this._client.scan(cursor, 'COUNT', 100);
			cursor = nextCursor;

			// oxlint-disable eslint-disable-next-line no-await-in-loop
			if (keys.length > 0) deletedCount += await this._client.unlink(...keys);
			if (cursor === '0') break;
		}

		return deletedCount;
	}

	private async _adjustBy(key: string, amount: number): Promise<number> {
		validateKey(key);
		validateAmount(amount);

		try {
			return await this._client.incrby(key, amount);
		} catch (e) {
			throw new InternalError(KV_STORE_ERROR_KEYS.NOT_INTEGER, e);
		}
	}
}

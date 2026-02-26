import { RedisClient, type RedisOptions } from 'bun';

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

		if (ttlSec) await this._client.set(key, serialized, 'EX', ttlSec);
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

		const res = await this._client.del(key);
		return res === 1;
	}

	public async expire(key: string, ttlSec: number): Promise<boolean> {
		validateKey(key);
		validateTtl(ttlSec);

		const res = await this._client.expire(key, ttlSec);
		return res === 1;
	}

	public async ttl(key: string): Promise<number> {
		validateKey(key);

		const res = await this._client.ttl(key);
		return res;
	}

	public async clean(): Promise<number> {
		let cursor = '0';
		let deletedCount = 0;

		while (true) {
			// eslint-disable-next-line-disable-next-line no-await-in-loop
			const [nextCursor, keys] = (await this._client.send('SCAN', [
				cursor,
				'COUNT',
				'100'
			])) as [string, string[]];
			cursor = nextCursor;

			// eslint-disable-next-line-disable-next-line no-await-in-loop
			if (keys.length > 0) deletedCount += await this._client.del(...keys);
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

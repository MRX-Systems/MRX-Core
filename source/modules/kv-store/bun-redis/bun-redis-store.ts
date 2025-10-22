import { RedisClient, type RedisOptions } from 'bun';

import { BaseError } from '#/errors/base-error';
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
		await this._client.connect();
	}

	public close?(): void {
		this._client.close();
	}

	public async get<T = unknown>(key: string): Promise<T | null> {
		const value = await this._client.get(key);
		if (value === null)
			return null;

		try {
			return JSON.parse(value) as T;
		} catch {
			return value as T;
		}
	}

	public async set<T = unknown>(key: string, value: T, ttlSec?: number): Promise<void> {
		const serialized = typeof value === 'string'
			? value
			: JSON.stringify(value);

		if (ttlSec)
			await this._client.set(key, serialized, 'EX', ttlSec);
		else
			await this._client.set(key, serialized);
	}

	public async increment(key: string, amount?: number): Promise<number> {
		let current = Number(await this._client.get(key));
		if (current !== null && isNaN(current))
			throw new BaseError(KV_STORE_ERROR_KEYS.NOT_INTEGER);
		current += (amount ?? 1);
		await this._client.set(key, current.toString());
		return current;
	}

	public async decrement(key: string, amount?: number): Promise<number> {
		let current = Number(await this._client.get(key));
		if (current !== null && isNaN(current))
			throw new BaseError(KV_STORE_ERROR_KEYS.NOT_INTEGER);
		current -= (amount ?? 1);
		await this._client.set(key, current.toString());
		return current;
	}

	public async del(key: string): Promise<boolean> {
		const res = await this._client.del(key);
		return res === 1;
	}

	public async expire(key: string, ttlSec: number): Promise<boolean> {
		const res = await this._client.expire(key, ttlSec);
		return res === 1;
	}

	public async ttl(key: string): Promise<number> {
		const res = await this._client.ttl(key);
		return res;
	}

	public async clean(): Promise<number> {
		const keys = await this._client.keys('*');
		if (keys.length === 0)
			return 0;
		return this._client.del(...keys);
	}
}
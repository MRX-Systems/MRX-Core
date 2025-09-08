import type { KvStore } from '#/modules/kv-store/types/kv-store';

export interface CacheOptions {
	/**
	 * Default TTL in seconds
	 *
	 * @defaultValue 60
	 */
	defaultTtl?: number;

	/**
	 * Cache key prefix
	 *
	 * @defaultValue ''
	 */
	prefix?: string;

	/**
	 * Storage backend
	 *
	 * @defaultValue ':memory:'
	 */
	store?: ':memory:' | KvStore;
}
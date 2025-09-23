import { afterEach, beforeEach, describe, expect, test } from 'bun:test';

import { BaseError } from '#/errors/base-error';
import { KV_STORE_ERROR_KEYS } from '#/modules/kv-store/enums/kv-store-error-keys';
import { MemoryStore } from '#/modules/kv-store/memory/memory-store';

describe('MemoryStore', () => {
	describe('Basic Operations', () => {
		test('should create empty store', () => {
			const store = new MemoryStore();
			expect(store.get<string>('nonexistent')).toBeNull();
			store.destroy();
		});

		test('should set and get values', () => {
			const store = new MemoryStore();
			store.set('key1', 'value1');
			expect(store.get<string>('key1')).toBe('value1');
			store.destroy();
		});

		test('should set and get values with TTL', () => {
			const store = new MemoryStore();
			store.set('key1', 'value1', 60);
			expect(store.get<string>('key1')).toBe('value1');

			const ttl = store.ttl('key1');
			expect(ttl).toBeGreaterThan(55);
			expect(ttl).toBeLessThanOrEqual(60);
			store.destroy();
		});

		test('should handle different value types', () => {
			const store = new MemoryStore();

			// String
			store.set('string', 'hello');
			expect(store.get<string>('string')).toBe('hello');

			// Number
			store.set('number', 42);
			expect(store.get<number>('number')).toBe(42);

			// Object
			const obj = { name: 'test', count: 5 };
			store.set('object', obj);
			expect(store.get<typeof obj>('object')).toEqual(obj);

			// Array
			const arr = [1, 2, 3];
			store.set('array', arr);
			expect(store.get<number[]>('array')).toEqual(arr);

			store.destroy();
		});
	});

	describe('Increment/Decrement Operations', () => {
		test('should increment values correctly', () => {
			const store = new MemoryStore();
			store.set('counter', 5);

			const result = store.increment('counter');
			expect(result).toBe(6);
			expect(store.get<number>('counter')).toBe(6);
			store.destroy();
		});

		test('should increment with custom amount', () => {
			const store = new MemoryStore();
			store.set('counter', 10);

			const result = store.increment('counter', 5);
			expect(result).toBe(15);
			expect(store.get<number>('counter')).toBe(15);
			store.destroy();
		});

		test('should decrement values correctly', () => {
			const store = new MemoryStore();
			store.set('counter', 10);

			const result = store.decrement('counter');
			expect(result).toBe(9);
			expect(store.get<number>('counter')).toBe(9);
			store.destroy();
		});

		test('should decrement with custom amount', () => {
			const store = new MemoryStore();
			store.set('counter', 20);

			const result = store.decrement('counter', 7);
			expect(result).toBe(13);
			expect(store.get<number>('counter')).toBe(13);
			store.destroy();
		});

		test('should handle increment on non-existent key', () => {
			const store = new MemoryStore();
			const result = store.increment('newcounter');
			expect(result).toBe(1);
			expect(store.get<number>('newcounter')).toBe(1);
			store.destroy();
		});

		test('should handle decrement on non-existent key', () => {
			const store = new MemoryStore();
			const result = store.decrement('newcounter');
			expect(result).toBe(-1);
			expect(store.get<number>('newcounter')).toBe(-1);
			store.destroy();
		});

		test('should throw error when incrementing non-number value', () => {
			const store = new MemoryStore();
			store.set('text', 'not a number');

			expect(() => store.increment('text')).toThrow(BaseError);
			expect(() => store.increment('text')).toThrow(KV_STORE_ERROR_KEYS.NOT_INTEGER);
			store.destroy();
		});

		test('should throw error when decrementing non-number value', () => {
			const store = new MemoryStore();
			store.set('object', { count: 5 });

			expect(() => store.decrement('object')).toThrow(BaseError);
			expect(() => store.decrement('object')).toThrow(KV_STORE_ERROR_KEYS.NOT_INTEGER);
			store.destroy();
		});

		test('should preserve TTL on increment/decrement', () => {
			const store = new MemoryStore();
			store.set('counter', 5, 60);

			const originalTtl = store.ttl('counter');
			store.increment('counter');
			const newTtl = store.ttl('counter');

			// TTL should remain approximately the same after increment
			expect(Math.abs(newTtl - originalTtl)).toBeLessThan(2);
			store.destroy();
		});
	});

	describe('TTL Management', () => {
		test('should set and get TTL correctly', () => {
			const store = new MemoryStore();
			store.set('key1', 'value1', 120);

			const ttl = store.ttl('key1');
			expect(ttl).toBeGreaterThan(115);
			expect(ttl).toBeLessThanOrEqual(120);
			store.destroy();
		});

		test('should return -1 for non-existent key TTL', () => {
			const store = new MemoryStore();
			expect(store.ttl('nonexistent')).toBe(-1);
			store.destroy();
		});

		test('should return -1 for keys without TTL', () => {
			const store = new MemoryStore();
			store.set('persistent', 'value'); // No TTL
			expect(store.ttl('persistent')).toBe(-1);
			store.destroy();
		});

		test('should update TTL with expire method', () => {
			const store = new MemoryStore();
			store.set('key', 'value'); // No initial TTL

			const result = store.expire('key', 30);
			expect(result).toBe(true);

			const ttl = store.ttl('key');
			expect(ttl).toBeGreaterThan(25);
			expect(ttl).toBeLessThanOrEqual(30);
			store.destroy();
		});

		test('should return false when expiring non-existent key', () => {
			const store = new MemoryStore();
			const result = store.expire('nonexistent', 30);
			expect(result).toBe(false);
			store.destroy();
		});
	});

	describe('Delete Operations', () => {
		test('should delete existing keys', () => {
			const store = new MemoryStore();
			store.set('key1', 'value1');

			const result = store.del('key1');
			expect(result).toBe(true);
			expect(store.get<string>('key1')).toBeNull();
			store.destroy();
		});

		test('should return false when deleting non-existent key', () => {
			const store = new MemoryStore();
			const result = store.del('nonexistent');
			expect(result).toBe(false);
			store.destroy();
		});

		test('should clean all keys', () => {
			const store = new MemoryStore();
			store.set('key1', 'value1');
			store.set('key2', 'value2');
			store.set('key3', 'value3');

			const deletedCount = store.clean();
			expect(deletedCount).toBe(3);
			expect(store.get<string>('key1')).toBeNull();
			expect(store.get<string>('key2')).toBeNull();
			expect(store.get<string>('key3')).toBeNull();
			store.destroy();
		});

		test('should return 0 when cleaning empty store', () => {
			const store = new MemoryStore();
			const deletedCount = store.clean();
			expect(deletedCount).toBe(0);
			store.destroy();
		});
	});

	describe('Expiration & Cleanup', () => {
		test('should expire keys after TTL', async () => {
			const store = new MemoryStore();
			store.set('shortlived', 'value', 1); // 1 second TTL

			expect(store.get<string>('shortlived')).toBe('value');

			// Wait for expiration
			await new Promise((resolve) => setTimeout(resolve, 1100));

			expect(store.get<string>('shortlived')).toBeNull();
			store.destroy();
		});

		test('should handle expired key increment gracefully', async () => {
			const store = new MemoryStore();
			store.set('expiring', 5, 1); // 1 second TTL

			// Wait for expiration
			await new Promise((resolve) => setTimeout(resolve, 1100));

			// Should create new entry with value 1 (no TTL)
			const result = store.increment('expiring');
			expect(result).toBe(1);
			expect(store.ttl('expiring')).toBe(-1); // No expiration
			store.destroy();
		});

		test('should trigger automatic cleanup', async () => {
			const store = new MemoryStore(100); // 100ms cleanup interval

			// Create multiple short-lived entries that will expire
			for (let i = 0; i < 5; ++i)
				store.set(`temp${i}`, `value${i}`, 1); // 1 second TTL

			// Create some entries that won't expire
			for (let i = 0; i < 3; ++i)
				store.set(`persist${i}`, `value${i}`, 60); // 60 seconds TTL

			// Verify entries exist
			expect(store.get<string>('temp0')).toBe('value0');
			expect(store.get<string>('temp4')).toBe('value4');
			expect(store.get<string>('persist0')).toBe('value0');

			// Wait for expiration and cleanup cycles
			await new Promise((resolve) => setTimeout(resolve, 1500));

			// Expired entries should be cleaned up automatically
			expect(store.get<string>('temp0')).toBeNull();
			expect(store.get<string>('temp4')).toBeNull();

			// Non-expired entries should still exist
			expect(store.get<string>('persist0')).toBe('value0');
			expect(store.get<string>('persist2')).toBe('value2');

			store.destroy();
		});

		test('should not cleanup keys without expiration', async () => {
			const store = new MemoryStore(100); // 100ms cleanup interval

			store.set('persistent', 'value'); // No TTL
			store.set('temporary', 'value', 1); // 1 second TTL

			// Wait for cleanup to run
			await new Promise((resolve) => setTimeout(resolve, 1200));

			expect(store.get<string>('persistent')).toBe('value'); // Should still exist
			expect(store.get<string>('temporary')).toBeNull(); // Should be cleaned up

			store.destroy();
		});

		test('should destroy store and cleanup resources', () => {
			const store = new MemoryStore();

			// Add some data
			store.set('key1', 'value1');
			store.set('key2', 'value2');

			expect(store.get<string>('key1')).toBe('value1');
			expect(store.get<string>('key2')).toBe('value2');

			// Destroy the store
			store.destroy();

			// All data should be cleared
			expect(store.get<string>('key1')).toBeNull();
			expect(store.get<string>('key2')).toBeNull();
		});
	});

	describe('Edge Cases', () => {
		test('should handle empty string values', () => {
			const store = new MemoryStore();
			store.set('empty', '');
			expect(store.get<string>('empty')).toBe('');
			store.destroy();
		});

		test('should handle null and undefined values', () => {
			const store = new MemoryStore();

			store.set('null', null);
			expect(store.get<null>('null')).toBeNull();

			store.set('undefined', undefined);
			expect(store.get<undefined>('undefined')).toBeUndefined();

			store.destroy();
		});

		test('should handle zero and negative numbers', () => {
			const store = new MemoryStore();

			store.set('zero', 0);
			expect(store.increment('zero')).toBe(1);

			store.set('negative', -5);
			expect(store.increment('negative')).toBe(-4);
			expect(store.decrement('negative')).toBe(-5);

			store.destroy();
		});

		test('should handle very large numbers', () => {
			const store = new MemoryStore();
			store.set('large', 999999999);

			const result = store.increment('large');
			expect(result).toBe(1000000000);
			store.destroy();
		});

		test('should handle decimal numbers', () => {
			const store = new MemoryStore();
			store.set('decimal', 5.5);

			const result = store.increment('decimal', 0.5);
			expect(result).toBe(6.0);
			store.destroy();
		});

		test('should handle boolean values', () => {
			const store = new MemoryStore();
			store.set('true', true);
			store.set('false', false);

			expect(() => store.increment('true')).toThrow(BaseError);
			expect(() => store.increment('false')).toThrow(BaseError);
			store.destroy();
		});
	});

	describe('Multiple Keys & Performance', () => {
		test('should handle multiple keys independently', () => {
			const store = new MemoryStore();

			store.set('key1', 'value1', 60);
			store.set('key2', 'value2', 120);
			store.set('counter1', 5, 60);
			store.set('counter2', 10, 60);

			expect(store.get<string>('key1')).toBe('value1');
			expect(store.get<string>('key2')).toBe('value2');

			expect(store.increment('counter1')).toBe(6);
			expect(store.increment('counter2')).toBe(11);

			// Original values should be unchanged
			expect(store.get<string>('key1')).toBe('value1');
			expect(store.get<string>('key2')).toBe('value2');

			store.destroy();
		});

		test('should handle many operations efficiently', () => {
			const store = new MemoryStore();
			const start = performance.now();

			// Perform many operations
			for (let i = 0; i < 1000; ++i) {
				store.set(`key${i}`, `value${i}`, 60);
				store.get<string>(`key${i}`);
				store.increment(`counter${i}`);
			}

			const end = performance.now();
			const duration = end - start;

			// Should complete 3000 operations in reasonable time (< 100ms)
			expect(duration).toBeLessThan(100);

			store.destroy();
		});
	});

	describe('Store Lifecycle', () => {
		let store: MemoryStore;

		beforeEach(() => {
			store = new MemoryStore();
		});

		afterEach(() => {
			store.destroy();
		});

		test('should create keys without expiration when using increment/decrement on non-existent keys', () => {
			const result = store.increment('newKey');

			expect(result).toBe(1);
			expect(store.get<number>('newKey')).toBe(1);
			expect(store.ttl('newKey')).toBe(-1); // No expiration
		});

		test('should preserve existing expiration when incrementing', () => {
			store.set('key', 5, 10); // 10 seconds TTL
			const result = store.increment('key');

			expect(result).toBe(6);
			const ttl = store.ttl('key');
			expect(ttl).toBeGreaterThan(8);
			expect(ttl).toBeLessThanOrEqual(10);
		});

		test('should handle concurrent operations correctly', () => {
			// Simulate concurrent increments
			store.set('counter', 0);

			for (let i = 0; i < 100; ++i)
				store.increment('counter');

			expect(store.get<number>('counter')).toBe(100);
		});

		test('should maintain data integrity during cleanup', async () => {
			const cleanupStore = new MemoryStore(50); // 50ms cleanup interval

			// Mix of persistent and expiring keys
			cleanupStore.set('persistent1', 'value1'); // No TTL
			cleanupStore.set('persistent2', 'value2'); // No TTL
			cleanupStore.set('temp1', 'value1', 1); // 1 second TTL
			cleanupStore.set('temp2', 'value2', 1); // 1 second TTL

			// Wait for expiration and multiple cleanup cycles
			await new Promise((resolve) => setTimeout(resolve, 1200));

			// Check data integrity
			expect(cleanupStore.get<string>('persistent1')).toBe('value1');
			expect(cleanupStore.get<string>('persistent2')).toBe('value2');
			expect(cleanupStore.get<null>('temp1')).toBeNull();
			expect(cleanupStore.get<null>('temp2')).toBeNull();

			cleanupStore.destroy();
		});
	});
});
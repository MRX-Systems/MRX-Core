import { describe, expect, test } from 'bun:test';
import { webcrypto } from 'crypto';

import { generateHmac } from '#/modules/totp/utils/generate-hmac';

describe('generateHmac', () => {
	const _createTestKey = async (secret: Uint8Array, algorithm = 'SHA-1'): Promise<CryptoKey> => await webcrypto.subtle.importKey(
		'raw',
		secret,
		{ name: 'HMAC', hash: algorithm },
		false,
		['sign']
	);

	const _createArrayBuffer = (text: string): ArrayBuffer => {
		const uint8Array = new TextEncoder().encode(text);
		return uint8Array.buffer.slice(0, uint8Array.byteLength) as ArrayBuffer;
	};

	test.concurrent('should generate HMAC with SHA-1 algorithm', async () => {
		// Arrange
		const secret = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
		const data = _createArrayBuffer('test data');
		const key = await _createTestKey(secret, 'SHA-1');

		// Act
		const result = await generateHmac(key, data);

		// Assert
		expect(result).toBeInstanceOf(Uint8Array);
		expect(result.length).toBe(20); // SHA-1 produces 20 bytes
	});

	test.concurrent('should generate HMAC with SHA-256 algorithm', async () => {
		// Arrange
		const secret = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
		const data = _createArrayBuffer('test data');
		const key = await _createTestKey(secret, 'SHA-256');

		// Act
		const result = await generateHmac(key, data);

		// Assert
		expect(result).toBeInstanceOf(Uint8Array);
		expect(result.length).toBe(32); // SHA-256 produces 32 bytes
	});

	test.concurrent('should generate HMAC with SHA-512 algorithm', async () => {
		// Arrange
		const secret = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
		const data = _createArrayBuffer('test data');
		const key = await _createTestKey(secret, 'SHA-512');

		// Act
		const result = await generateHmac(key, data);

		// Assert
		expect(result).toBeInstanceOf(Uint8Array);
		expect(result.length).toBe(64); // SHA-512 produces 64 bytes
	});

	test.concurrent('should generate different HMACs for different data', async () => {
		// Arrange
		const secret = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
		const data1 = _createArrayBuffer('test data 1');
		const data2 = _createArrayBuffer('test data 2');
		const key = await _createTestKey(secret);

		// Act
		const result1 = await generateHmac(key, data1);
		const result2 = await generateHmac(key, data2);

		// Assert
		expect(result1).not.toEqual(result2);
	});

	test.concurrent('should generate different HMACs for different keys', async () => {
		// Arrange
		const secret1 = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
		const secret2 = new Uint8Array([10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
		const data = _createArrayBuffer('test data');
		const key1 = await _createTestKey(secret1);
		const key2 = await _createTestKey(secret2);

		// Act
		const result1 = await generateHmac(key1, data);
		const result2 = await generateHmac(key2, data);

		// Assert
		expect(result1).not.toEqual(result2);
	});

	test.concurrent('should generate same HMAC for same key and data', async () => {
		// Arrange
		const secret = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
		const data = _createArrayBuffer('test data');
		const key = await _createTestKey(secret);

		// Act
		const result1 = await generateHmac(key, data);
		const result2 = await generateHmac(key, data);

		// Assert
		expect(result1).toEqual(result2);
	});

	test.concurrent('should handle empty data', async () => {
		// Arrange
		const secret = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
		const data = new ArrayBuffer(0);
		const key = await _createTestKey(secret);

		// Act
		const result = await generateHmac(key, data);

		// Assert
		expect(result).toBeInstanceOf(Uint8Array);
		expect(result.length).toBe(20); // SHA-1 produces 20 bytes even for empty data
	});

	test.concurrent('should handle large data', async () => {
		// Arrange
		const secret = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
		const largeData = new ArrayBuffer(10000);
		const key = await _createTestKey(secret);

		// Act
		const result = await generateHmac(key, largeData);

		// Assert
		expect(result).toBeInstanceOf(Uint8Array);
		expect(result.length).toBe(20);
	});

	test.concurrent('should produce deterministic results', async () => {
		// Arrange
		const secret = new Uint8Array([
			0x12,
			0x34,
			0x56,
			0x78,
			0x90,
			0xab,
			0xcd,
			0xef,
			0x12,
			0x34,
			0x56,
			0x78,
			0x90,
			0xab,
			0xcd,
			0xef,
			0x12,
			0x34,
			0x56,
			0x78
		]);
		const data = _createArrayBuffer('The quick brown fox jumps over the lazy dog');
		const key = await _createTestKey(secret);

		// Act
		const result = await generateHmac(key, data);

		// Assert - This should produce a known HMAC for this specific input
		expect(result).toBeInstanceOf(Uint8Array);
		expect(result.length).toBe(20);
		// We can verify the result is deterministic by running it multiple times
		const result2 = await generateHmac(key, data);
		expect(result).toEqual(result2);
	});
});
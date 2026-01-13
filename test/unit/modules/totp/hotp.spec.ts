import { describe, expect, test } from 'bun:test';

import { clearKeyCache, hotp } from '#/modules/totp/hotp';
import { TOTP_ERROR_KEYS } from '#/modules/totp/enums/totp-error-keys';

// RFC 4226 test secret: "12345678901234567890" (20 bytes)
const RFC_SECRET = new TextEncoder().encode('12345678901234567890');

// Minimum valid secret (16 bytes)
const MIN_SECRET = new Uint8Array(16).fill(0x42);

describe.concurrent('hotp', () => {
	test('should generate 6-digit code by default', async () => {
		const code = await hotp(MIN_SECRET, 0);
		expect(code).toMatch(/^\d{6}$/);
	});

	test('should generate 8-digit code when specified', async () => {
		const code = await hotp(MIN_SECRET, 0, { digits: 8 });
		expect(code).toMatch(/^\d{8}$/);
	});

	test('should generate consistent codes for same inputs', async () => {
		const code1 = await hotp(RFC_SECRET, 1);
		const code2 = await hotp(RFC_SECRET, 1);
		expect(code1).toBe(code2);
	});

	test('should generate different codes for different counters', async () => {
		const code1 = await hotp(RFC_SECRET, 0);
		const code2 = await hotp(RFC_SECRET, 1);
		expect(code1).not.toBe(code2);
	});

	test('should work with SHA-256', async () => {
		const code = await hotp(MIN_SECRET, 0, { algorithm: 'SHA-256' });
		expect(code).toMatch(/^\d{6}$/);
	});

	test('should work with SHA-512', async () => {
		const code = await hotp(MIN_SECRET, 0, { algorithm: 'SHA-512' });
		expect(code).toMatch(/^\d{6}$/);
	});

	test('should throw for secret shorter than 16 bytes', () => {
		const shortSecret = new Uint8Array(15);
		expect(hotp(shortSecret, 0)).rejects.toThrow(TOTP_ERROR_KEYS.WEAK_SECRET);
	});

	test('should work with bigint counter', async () => {
		const code = await hotp(MIN_SECRET, 1n);
		expect(code).toMatch(/^\d{6}$/);
	});
});

describe('hotp cache', () => {
	test('should evict oldest entry when cache exceeds 100 entries', async () => {
		// Clear cache before test
		clearKeyCache();

		// Generate 101 unique secrets to trigger LRU eviction
		const secrets: Uint8Array[] = [];
		for (let i = 0; i < 101; ++i) {
			const secret = new Uint8Array(16);
			secret[0] = i;
			secret[1] = i >> 8;
			secrets.push(secret);
		}

		// Fill cache with 101 different secrets
		for (const secret of secrets)
			await hotp(secret, 0);

		// Cache should have evicted the first entry, but still work
		const code = await hotp(secrets[0], 0);
		expect(code).toMatch(/^\d{6}$/);

		// Clean up
		clearKeyCache();
	});

	test('clearKeyCache should clear all cached keys', async () => {
		await hotp(MIN_SECRET, 0);
		clearKeyCache();
		// Should still work after clearing (will re-create key)
		const code = await hotp(MIN_SECRET, 0);
		expect(code).toMatch(/^\d{6}$/);
	});
});
import { describe, expect, test } from 'bun:test';

import { totp, verifyTotp } from '#/modules/totp/totp';
import { TOTP_ERROR_KEYS } from '#/modules/totp/enums/totp-error-keys';

// Minimum valid secret (16 bytes)
const SECRET = new Uint8Array(16).fill(0x42);

describe.concurrent('totp', () => {
	test('should generate 6-digit code by default', async () => {
		const code = await totp(SECRET);
		expect(code).toMatch(/^\d{6}$/);
	});

	test('should generate 8-digit code when specified', async () => {
		const code = await totp(SECRET, { digits: 8 });
		expect(code).toMatch(/^\d{8}$/);
	});

	test('should generate same code for same time step', async () => {
		const now = Date.now();
		const code1 = await totp(SECRET, { now });
		const code2 = await totp(SECRET, { now });
		expect(code1).toBe(code2);
	});

	test('should work with custom period', async () => {
		const code = await totp(SECRET, { period: 60 });
		expect(code).toMatch(/^\d{6}$/);
	});

	test('should work with SHA-256', async () => {
		const code = await totp(SECRET, { algorithm: 'SHA-256' });
		expect(code).toMatch(/^\d{6}$/);
	});
});

describe.concurrent('verifyTotp', () => {
	test('should verify valid code', async () => {
		const now = Date.now();
		const code = await totp(SECRET, { now });
		const valid = await verifyTotp(SECRET, code, { now });
		expect(valid).toBe(true);
	});

	test('should reject wrong code', async () => {
		const valid = await verifyTotp(SECRET, '000000');
		expect(valid).toBe(false);
	});

	test('should reject non-numeric code', async () => {
		const valid = await verifyTotp(SECRET, 'abcdef');
		expect(valid).toBe(false);
	});

	test('should reject code with wrong length', async () => {
		const valid = await verifyTotp(SECRET, '12345');
		expect(valid).toBe(false);
	});

	test('should verify with window > 0', async () => {
		const now = Date.now();
		const code = await totp(SECRET, { now });
		// Code should still be valid with window tolerance
		const valid = await verifyTotp(SECRET, code, { now, window: 1 });
		expect(valid).toBe(true);
	});

	test('should throw for window > 10', () => {
		expect(verifyTotp(SECRET, '123456', { window: 11 }))
			.rejects.toThrow(TOTP_ERROR_KEYS.INVALID_WINDOW);
	});

	test('should throw for negative window', () => {
		expect(verifyTotp(SECRET, '123456', { window: -1 }))
			.rejects.toThrow(TOTP_ERROR_KEYS.INVALID_WINDOW);
	});
});

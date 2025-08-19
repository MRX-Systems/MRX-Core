import { describe, expect, test } from 'bun:test';

import { totp, verifyTotp } from '#/modules/totp/totp';

describe('totp', () => {
	test('should generate a valid TOTP code', async () => {
		const secret = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07]);
		const code = await totp(secret);
		expect(code.length).toBe(6);
		expect(code).toMatch(/^\d{6}$/);
	});
});

describe('verifyTotp', () => {
	test('should verify a valid TOTP code', async () => {
		const secret = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07]);
		const code = await totp(secret);
		const isValid = await verifyTotp(secret, code);
		expect(isValid).toBe(true);
	});

	test('should reject an invalid TOTP code', async () => {
		const secret = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07]);
		const isValid = await verifyTotp(secret, 'invalid');
		expect(isValid).toBe(false);
	});
});

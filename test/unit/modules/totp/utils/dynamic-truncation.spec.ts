import { describe, expect, test } from 'bun:test';

import { TOTP_ERROR_KEYS } from '#/modules/totp/enums/totp-error-keys';
import { dynamicTruncation } from '#/modules/totp/utils/dynamic-truncation';

// RFC 4226 test HMAC result
const RFC_HMAC = new Uint8Array([
	0x1f,
	0x86,
	0x98,
	0x69,
	0x0e,
	0x02,
	0xca,
	0x16,
	0x61,
	0x85,
	0x50,
	0xef,
	0x7f,
	0x19,
	0xda,
	0x8e,
	0x94,
	0x5b,
	0x55,
	0x5a
]);

describe.concurrent('dynamicTruncation', () => {
	test('should truncate to 6 digits', () => {
		expect(dynamicTruncation(RFC_HMAC, 6)).toBe('872921');
	});

	test('should truncate to 8 digits', () => {
		expect(dynamicTruncation(RFC_HMAC, 8)).toBe('57872921');
	});

	test('should pad with leading zeros', () => {
		const hmac = new Uint8Array(20).fill(0x00);
		hmac[19] = 0x00; // offset = 0
		const result = dynamicTruncation(hmac, 6);
		expect(result).toBe('000000');
	});

	test('should return consistent results', () => {
		const r1 = dynamicTruncation(RFC_HMAC, 6);
		const r2 = dynamicTruncation(RFC_HMAC, 6);
		expect(r1).toBe(r2);
	});

	test('should handle offset 0', () => {
		const hmac = new Uint8Array(20);
		hmac[19] = 0x00; // offset = 0
		hmac[0] = 0x12;
		hmac[1] = 0x34;
		hmac[2] = 0x56;
		hmac[3] = 0x78;
		const result = dynamicTruncation(hmac, 6);
		expect(result).toMatch(/^\d{6}$/);
	});

	test('should handle offset 15', () => {
		const hmac = new Uint8Array(20);
		hmac[19] = 0x0f; // offset = 15
		hmac[15] = 0x12;
		hmac[16] = 0x34;
		hmac[17] = 0x56;
		hmac[18] = 0x78;
		const result = dynamicTruncation(hmac, 6);
		expect(result).toMatch(/^\d{6}$/);
	});

	test('should mask MSB correctly', () => {
		const hmac = new Uint8Array(20).fill(0xff);
		hmac[19] = 0x00; // offset = 0
		const result = dynamicTruncation(hmac, 6);
		expect(result).toMatch(/^\d{6}$/);
	});

	test('should throw for HMAC shorter than 20 bytes', () => {
		const shortHmac = new Uint8Array(19);
		expect(() => dynamicTruncation(shortHmac, 6)).toThrow(TOTP_ERROR_KEYS.INVALID_HMAC_LENGTH);
	});

	test('should throw for invalid digits', () => {
		// @ts-expect-error Testing invalid input
		expect(() => dynamicTruncation(RFC_HMAC, 4)).toThrow(TOTP_ERROR_KEYS.INVALID_DIGITS);
	});
});

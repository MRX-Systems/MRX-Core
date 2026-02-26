import { describe, expect, test } from 'bun:test';

import { TOTP_ERROR_KEYS } from '#/modules/totp/enums/totp-error-keys';
import { base32Decode, base32Encode } from '#/modules/totp/utils/base32';

describe.concurrent('base32Encode', () => {
	test('should encode bytes to base32', () => {
		const input = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]); // "Hello"
		expect(base32Encode(input)).toBe('JBSWY3DP');
	});

	test('should encode string to base32', () => {
		expect(base32Encode('Hello')).toBe('JBSWY3DP');
	});

	test('should return empty string for empty input', () => {
		expect(base32Encode(new Uint8Array(0))).toBe('');
	});

	test('should add padding by default', () => {
		const result = base32Encode('f');
		expect(result.endsWith('=')).toBe(true);
		expect(result.length % 8).toBe(0);
	});

	test('should skip padding when disabled', () => {
		const result = base32Encode('f', false);
		expect(result.endsWith('=')).toBe(false);
	});
});

describe.concurrent('base32Decode', () => {
	test('should decode base32 to bytes', () => {
		expect(base32Decode('JBSWY3DP')).toEqual(new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]));
	});

	test('should handle lowercase input', () => {
		expect(base32Decode('jbswy3dp')).toEqual(new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]));
	});

	test('should handle mixed case input', () => {
		expect(base32Decode('JbSwY3Dp')).toEqual(new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]));
	});

	test('should strip padding', () => {
		expect(base32Decode('JBSWY3DP======')).toEqual(new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]));
	});

	test('should return empty array for empty input', () => {
		expect(base32Decode('')).toEqual(new Uint8Array(0));
	});

	test('should throw for invalid character', () => {
		expect(() => base32Decode('INVALID!')).toThrow(TOTP_ERROR_KEYS.INVALID_BASE32_CHARACTER);
	});

	test('should roundtrip encode/decode', () => {
		const original = new Uint8Array([0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99]);
		const encoded = base32Encode(original);
		const decoded = base32Decode(encoded);
		expect(decoded).toEqual(original);
	});
});
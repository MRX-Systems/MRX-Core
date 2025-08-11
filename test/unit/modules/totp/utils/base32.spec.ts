import { describe, expect, test } from 'bun:test';

import { TOTP_ERROR_KEYS } from '#/modules/totp/enums/totpErrorKeys';
import {
	base32Decode,
	base32Encode
} from '#/modules/totp/utils/base32';

describe('base32', () => {
	describe('base32Encode', () => {
		test('should encode a Uint8Array to a base32 string', () => {
			const input = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
			const expected = 'JBSWY3DP';
			expect(base32Encode(input)).toBe(expected);
		});
	});

	describe('base32Decode', () => {
		test('should decode a base32 string to a Uint8Array', () => {
			const input = 'JBSWY3DP';
			const expected = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
			expect(base32Decode(input)).toEqual(expected);
		});

		test('should throw error for invalid base32 character', () => {
			const input = 'INVALID@CHARACTER';
			expect(() => base32Decode(input)).toThrow(TOTP_ERROR_KEYS.INVALID_BASE32_CHARACTER);
		});
	});
});
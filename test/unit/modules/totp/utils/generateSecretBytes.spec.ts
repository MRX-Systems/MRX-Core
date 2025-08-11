import { describe, expect, test } from 'bun:test';

import { TOTP_ERROR_KEYS } from '#/modules/totp/enums/totpErrorKeys';
import { generateSecretBytes } from '#/modules/totp/utils/generateSecretBytes';

describe('generateSecretBytes', () => {
	test('should generate 20 random bytes, is default option', () => {
		const result = generateSecretBytes();
		expect(result).toBeInstanceOf(Uint8Array);
		expect(result.length).toBe(20);
	});

	test('should generate specified number of random bytes', () => {
		const length = 32;
		const result = generateSecretBytes(length);
		expect(result).toBeInstanceOf(Uint8Array);
		expect(result.length).toBe(length);
	});

	test('should throw error for zero length', () => {
		expect(() => generateSecretBytes(0)).toThrow(TOTP_ERROR_KEYS.INVALID_SECRET_LENGTH);
	});

	test('should throw error for negative length', () => {
		expect(() => generateSecretBytes(-1)).toThrow(TOTP_ERROR_KEYS.INVALID_SECRET_LENGTH);
	});
});
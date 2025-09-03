import { BaseError } from '#/errors/baseError';
import { TOTP_ERROR_KEYS } from '#/modules/totp/enums/totpErrorKeys';

/**
 * Base32 alphabet according to RFC 4648
 */
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Encode bytes to Base32 string
 *
 * @param input - Bytes or string to encode
 * @param withPadding - Whether to include padding (default: true)
 *
 * @returns Base32 encoded string
 */
export const base32Encode = (input: string | Uint8Array, withPadding = true): string => {
	let result = '';
	let bits = 0;
	let value = 0;

	const bytes = input instanceof Uint8Array
		? input
		: new TextEncoder().encode(input);

	for (const byte of bytes) {
		value = (value << 8) | byte;
		bits += 8;

		while (bits >= 5) {
			result += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
			bits -= 5;
		}
	}

	if (bits > 0)
		result += BASE32_ALPHABET[(value << (5 - bits)) & 31];

	if (withPadding)
		while (result.length % 8 !== 0)
			result += '=';

	return result;
};

/**
 * Decode Base32 string to bytes
 *
 * @param base32 - Base32 string to decode
 *
 * @throws ({@link BaseError}) - if invalid Base32 character is found
 *
 * @returns Decoded bytes
 */
export const base32Decode = (base32: string): Uint8Array => {
	const cleanBase32 = base32.replace(/=+$/, '');

	if (cleanBase32.length === 0)
		return new Uint8Array(0);

	const result: number[] = [];
	let bits = 0;
	let value = 0;

	for (const char of cleanBase32) {
		const charValue = BASE32_ALPHABET.indexOf(char);
		if (charValue === -1)
			throw new BaseError({
				message: TOTP_ERROR_KEYS.INVALID_BASE32_CHARACTER,
				cause: `Invalid Base32 character: ${char}`
			});

		value = (value << 5) | charValue;
		bits += 5;

		if (bits >= 8) {
			result.push((value >>> (bits - 8)) & 255);
			bits -= 8;
		}
	}
	return new Uint8Array(result);
};

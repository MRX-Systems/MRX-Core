import { InternalError } from '#/errors/internal-error';
import { TOTP_ERROR_KEYS } from '#/modules/totp/enums/totp-error-keys';

/**
 * Base32 alphabet according to RFC 4648
 */
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Lookup table for O(1) Base32 character → value mapping
 *
 * @remarks
 * Performance: Using a Map provides O(1) lookup instead of O(n) indexOf.
 * This is a significant optimization for decoding operations.
 */
const _BASE32_LOOKUP: ReadonlyMap<string, number> = new Map(
	Array.from(BASE32_ALPHABET, (char, index) => [char, index])
);

/**
 * Encode bytes to Base32 string
 *
 * @remarks
 * Performance: Uses array.join() instead of string concatenation
 * to avoid creating intermediate strings in the hot path.
 *
 * @param input - Bytes or string to encode
 * @param withPadding - Whether to include padding (default: true)
 *
 * @returns Base32 encoded string
 */
export const base32Encode = (input: string | Uint8Array, withPadding = true): string => {
	const bytes = input instanceof Uint8Array
		? input
		: new TextEncoder().encode(input);

	if (bytes.length === 0)
		return '';

	// Performance: Pre-allocate array for output characters
	// Each 5 bytes → 8 Base32 chars, so estimate upper bound
	const estimatedLength = Math.ceil((bytes.length * 8) / 5);
	const chars: string[] = new Array(estimatedLength);

	let bits = 0;
	let value = 0;
	let charIndex = 0;

	for (let i = 0; i < bytes.length; ++i) {
		value = (value << 8) | bytes[i];
		bits += 8;

		while (bits >= 5) {
			chars[charIndex++] = BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
			bits -= 5;
		}
	}

	if (bits > 0)
		chars[charIndex++] = BASE32_ALPHABET[(value << (5 - bits)) & 31];

	// Performance: Use slice + join instead of string concatenation
	let result = chars.slice(0, charIndex).join('');

	if (withPadding)
		while (result.length % 8 !== 0)
			result += '=';

	return result;
};

/**
 * Decode Base32 string to bytes
 *
 * @remarks
 * Security: Case-insensitive decoding per RFC 4648 recommendation.
 * Performance: Uses Map lookup for O(1) character value retrieval.
 * Performance: Pre-allocates output array based on input length.
 *
 * @param base32 - Base32 string to decode (case-insensitive)
 *
 * @throws ({@link InternalError}) - if invalid Base32 character is found
 *
 * @returns Decoded bytes
 */
export const base32Decode = (base32: string): Uint8Array => {
	// Security: Convert to uppercase for case-insensitive decoding (RFC 4648)
	const cleanBase32 = base32.toUpperCase().replace(/=+$/, '');
	const inputLength = cleanBase32.length;

	if (inputLength === 0)
		return new Uint8Array(0);

	// Performance: Pre-calculate output size
	// Each 8 Base32 chars → 5 bytes
	const outputLength = Math.floor((inputLength * 5) / 8);
	const result = new Uint8Array(outputLength);

	let bits = 0;
	let value = 0;
	let outputIndex = 0;

	for (let i = 0; i < inputLength; ++i) {
		const char = cleanBase32[i];
		const charValue = _BASE32_LOOKUP.get(char);

		// Security: Validate character without leaking which character failed
		if (charValue === undefined)
			throw new InternalError(TOTP_ERROR_KEYS.INVALID_BASE32_CHARACTER, 'Invalid Base32 character');

		value = (value << 5) | charValue;
		bits += 5;

		if (bits >= 8) {
			result[outputIndex++] = (value >>> (bits - 8)) & 255;
			bits -= 8;
		}
	}

	return result;
};
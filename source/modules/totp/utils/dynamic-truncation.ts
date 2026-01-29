import { InternalError } from '#/errors/internal-error';
import { TOTP_ERROR_KEYS } from '#/modules/totp/enums/totp-error-keys';
import type { OtpDigits } from '#/modules/totp/types/index';

/**
 * Precomputed modulo values for supported digit counts
 *
 * @remarks
 * Performance: Lookup avoids computing 10**digits on every call in hot path.
 */
const _DIGIT_MODULO: Record<OtpDigits, number> = {
	6: 1_000_000,
	8: 100_000_000
};

/**
 * Perform dynamic truncation on HMAC result according to RFC 4226
 *
 * @param hmacArray - HMAC result as byte array (minimum 20 bytes)
 * @param digits - Number of digits in the final code (6 or 8)
 *
 * @throws ({@link InternalError}) - if HMAC array is too short or digits is invalid
 *
 * @returns Truncated code as string with leading zeros
 */
export const dynamicTruncation = (
	hmacArray: Uint8Array,
	digits: OtpDigits
): string => {
	// Security: Validate HMAC length (minimum 20 bytes for SHA-1)
	if (hmacArray.length < 20)
		throw new InternalError(TOTP_ERROR_KEYS.INVALID_HMAC_LENGTH, 'HMAC must be at least 20 bytes');

	// Security: Validate digits parameter
	const modulo = _DIGIT_MODULO[digits];
	if (modulo === undefined)
		throw new InternalError(TOTP_ERROR_KEYS.INVALID_DIGITS, 'Digits must be 6 or 8');

	const offset = hmacArray[hmacArray.length - 1] & 0x0f;

	// Security: Validate offset bounds (offset + 4 must not exceed array length)
	if (offset + 4 > hmacArray.length)
		throw new InternalError(TOTP_ERROR_KEYS.INVALID_HMAC_LENGTH, 'HMAC too short for computed offset');

	const code = (
		((hmacArray[offset] & 0x7f) << 24)
		| ((hmacArray[offset + 1] & 0xff) << 16)
		| ((hmacArray[offset + 2] & 0xff) << 8)
		| (hmacArray[offset + 3] & 0xff)
	) % modulo;

	return code.toString().padStart(digits, '0');
};

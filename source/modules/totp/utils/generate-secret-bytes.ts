import { getRandomValues } from 'crypto';

import { InternalError } from '#/errors/internal-error';
import { TOTP_ERROR_KEYS } from '#/modules/totp/enums/totp-error-keys';

/**
 * Generate cryptographically secure random bytes for TOTP secret
 *
 * @param length - Number of bytes to generate (default: 20)
 *
 * @throws ({@link InternalError}) if length is not positive
 *
 * @returns Uint8Array containing the random bytes
 */
export const generateSecretBytes = (length = 20): Uint8Array => {
	if (length <= 0)
		throw new InternalError(TOTP_ERROR_KEYS.INVALID_SECRET_LENGTH);
	return getRandomValues(new Uint8Array(length));
};

import { hotp } from './hotp';
import type { TotpOptions } from './types/totp-options';
import type { VerifyOptions } from './types/verify-options';

/**
 * Time-based One-Time Password (TOTP) implementation
 *
 * @param secret - Secret key as bytes
 * @param opts - TOTP options including current time
 *
 * @returns Promise resolving to the TOTP code
 */
export const totp = async (
	secret: Uint8Array,
	{
		algorithm = 'SHA-1',
		digits = 6,
		period = 30,
		now = Date.now()
	}: TotpOptions & { now?: number } = {}
): Promise<string> => {
	const timeStep = Math.floor(now / 1000 / period);
	return hotp(secret, timeStep, { algorithm, digits });
};


/**
 * Verify a TOTP code against a secret
 *
 * @param secret - Secret key as bytes
 * @param code - Code to verify
 * @param opts - Verification options
 *
 * @returns Promise resolving to true if code is valid
 */
export const verifyTotp = async (
	secret: Uint8Array,
	code: string,
	{
		algorithm = 'SHA-1',
		digits = 6,
		period = 30,
		window = 0,
		now = Date.now()
	}: VerifyOptions = {}
): Promise<boolean> => {
	const currentTimeStep = Math.floor(now / 1000 / period);

	for (let i = -window; i <= window; ++i) {
		const timeStep = currentTimeStep + i;
		const expectedCode = await hotp(secret, timeStep, { algorithm, digits });
		if (expectedCode === code)
			return true;
	}
	return false;
};



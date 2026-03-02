import { timingSafeEqual } from 'crypto';

import { InternalError } from '#/errors/internal-error';
import { TOTP_ERROR_KEYS } from './enums/totp-error-keys';
import { hotp } from './hotp';
import type { TotpOptions } from './types/totp-options';
import type { VerifyOptions } from './types/verify-options';

/**
 * Time-based One-Time Password (TOTP) implementation per RFC 6238
 *
 * @param secret - Secret key as bytes (minimum 16 bytes)
 * @param opts - TOTP options including current time
 *
 * @returns Promise resolving to the TOTP code
 */
export const totp = (
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
 * Perform constant-time string comparison
 *
 * @remarks
 * Security: Uses crypto.timingSafeEqual to prevent timing attacks.
 * An attacker cannot measure response time differences to guess valid codes.
 * Always compares in constant time, even for length mismatches (CWE-208).
 *
 * @param a - First string
 * @param b - Second string
 *
 * @returns true if strings are equal
 */
const _timingSafeCompare = (a: string, b: string): boolean => {
	const bufferA = Buffer.from(a);
	const bufferB = Buffer.from(b);

	try {
		return timingSafeEqual(bufferA, bufferB);
	} catch {
		// timingSafeEqual throws if buffers have different lengths
		// Constant-time return false (exception thrown in constant time)
		return false;
	}
};

/**
 * Verify a TOTP code against a secret
 *
 * @remarks
 * Security: Uses constant-time comparison to prevent timing attacks (CWE-208).
 * Security: Always iterates through all windows to prevent leaking which time step matched.
 * Security: Validates window size to prevent DoS attacks (CWE-400).
 * Performance: Parallelizes code generation when window > 0.
 *
 * @param secret - Secret key as bytes (minimum 16 bytes)
 * @param code - Code to verify
 * @param opts - Verification options
 *
 * @throws ({@link InternalError}) - if window is invalid
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
	// Security: Limit window to prevent DoS (±10 = ±5 min with 30s period)
	// window=N checks N periods in the past and N periods in the future (2N+1 total time steps)
	if (window < 0 || window > 1)
		throw new InternalError(
			TOTP_ERROR_KEYS.INVALID_WINDOW,
			'Window must be between 0 and 1 (window=N checks ±N periods, total 2N+1 time steps)'
		);

	// Security: Early validation of code format (before expensive crypto)
	// This is safe because format validation doesn't leak secret information
	if (!/^\d+$/.test(code) || code.length !== digits) return false;

	const currentTimeStep = Math.floor(now / 1000 / period);

	// Performance: For window=0, skip parallelization overhead
	if (window === 0) {
		const expectedCode = await hotp(secret, currentTimeStep, { algorithm, digits });
		return _timingSafeCompare(expectedCode, code);
	}

	// Performance: Generate all codes in parallel for window > 0
	const timeSteps: number[] = [];
	for (let i = -window; i <= window; ++i) timeSteps.push(currentTimeStep + i);

	const expectedCodes = await Promise.all(
		timeSteps.map((timeStep) => hotp(secret, timeStep, { algorithm, digits }))
	);

	// Security: Always check all codes to prevent timing leaks
	// Don't early-return when a match is found
	let isValid = false;
	for (const expectedCode of expectedCodes)
		if (_timingSafeCompare(expectedCode, code)) isValid = true;

	return isValid;
};

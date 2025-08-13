import { webcrypto } from 'crypto';

import { BaseError } from '#/errors/baseError';
import { TOTP_ERROR_KEYS } from './enums/totpErrorKeys';
import type { OtpAuthUri } from './types/otpAuthUri';
import type { TotpOptions } from './types/totpOptions';
import type { VerifyOptions } from './types/verifyOptions';
import { createCounterBuffer } from './utils/createCounterBuffer';
import { dynamicTruncation } from './utils/dynamicTruncation';
import { generateHmac } from './utils/generateHmac';

/**
 * HMAC-based One-Time Password (HOTP) implementation
 *
 * @param secret - Secret key as bytes
 * @param counter - Counter value
 * @param opts - HOTP options
 *
 * @returns Promise resolving to the HOTP code
 */
export const hotp = async (
	secret: Uint8Array,
	counter: number | bigint,
	{
		algorithm = 'SHA-1',
		digits = 6
	}: TotpOptions
): Promise<string> => {
	const counterBuffer = createCounterBuffer(counter);
	const key = await webcrypto.subtle.importKey(
		'raw',
		secret,
		{ name: 'HMAC', hash: algorithm },
		false,
		['sign']
	);
	const hmacArray = await generateHmac(key, counterBuffer);
	return dynamicTruncation(hmacArray, digits);
};

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

/**
 * Build an OTPAuth URI for QR code generation
 *
 * @param params - URI parameters
 *
 * @returns OTPAuth URI string
 */
export const buildOtpAuthUri = (
	{
		secretBase32,
		label,
		issuer,
		algorithm = 'SHA-1',
		digits = 6,
		period = 30
	}: OtpAuthUri
): string => {
	const encodedLabel = encodeURIComponent(label);
	const encodedIssuer = issuer
		? encodeURIComponent(issuer)
		: undefined;

	let uri = `otpauth://totp/${encodedLabel}?secret=${secretBase32}`;

	if (encodedIssuer)
		uri += `&issuer=${encodedIssuer}`;

	if (algorithm !== 'SHA-1')
		uri += `&algorithm=${algorithm}`;

	if (digits !== 6)
		uri += `&digits=${digits}`;

	if (period !== 30)
		uri += `&period=${period}`;
	return uri;
};

/**
 * Parse an OTPAuth URI
 *
 * @param uri - OTPAuth URI to parse
 *
 * @throws ({@link BaseError}) if the URI is invalid or missing required parameters
 *
 * @returns Parsed URI parameters
 */
export const parseOtpAuthUri = (uri: string): Omit<OtpAuthUri, 'issuer'> & { issuer?: string } => {
	const url = new URL(uri);

	if (url.protocol !== 'otpauth:')
		throw new BaseError({
			message: TOTP_ERROR_KEYS.INVALID_OTP_AUTH_URI
		});

	if (url.hostname !== 'totp')
		throw new BaseError({
			message: TOTP_ERROR_KEYS.INVALID_OTP_AUTH_URI
		});

	const label = decodeURIComponent(url.pathname.slice(1));
	const secretBase32 = url.searchParams.get('secret');

	if (!secretBase32)
		throw new BaseError({
			message: TOTP_ERROR_KEYS.MISSING_SECRET
		});

	const issuerParam = url.searchParams.get('issuer');
	const issuer = issuerParam ? decodeURIComponent(issuerParam) : undefined;

	const algorithm = (url.searchParams.get('algorithm') || 'SHA-1') as 'SHA-1' | 'SHA-256' | 'SHA-512';
	const digits = parseInt(url.searchParams.get('digits') || '6', 10) as 6 | 8;
	const period = parseInt(url.searchParams.get('period') || '30', 10);

	const result = {
		secretBase32,
		label,
		algorithm,
		digits,
		period,
		...(issuer && { issuer })
	};

	return result;
};

/**
 * Calculate remaining time until next TOTP code
 *
 * @param period - Time period in seconds (default: 30)
 * @param now - Current timestamp in milliseconds (default: Date.now())
 *
 * @returns Seconds remaining until next code
 */
export const timeRemaining = (period = 30, now = Date.now()): number => {
	const elapsed = Math.floor(now / 1000) % period;
	return period - elapsed;
};

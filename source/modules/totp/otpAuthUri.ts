import { BaseError } from '#/errors/baseError';
import { TOTP_ERROR_KEYS } from './enums/totpErrorKeys';
import type { OtpAuthUri } from './types/otpAuthUri';

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
 * @throws ({@link BaseError}) - if the URI is invalid or missing required parameters
 *
 * @returns Parsed URI parameters
 */
export const parseOtpAuthUri = (uri: string): Required<Omit<OtpAuthUri, 'issuer'>> & { issuer?: string } => {
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
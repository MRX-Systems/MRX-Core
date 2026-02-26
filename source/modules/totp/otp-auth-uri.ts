import { InternalError } from '#/errors/internal-error';
import { TOTP_ERROR_KEYS } from './enums/totp-error-keys';
import type { HashAlgorithm, OtpDigits } from './types';
import type { OtpAuthUri } from './types/otp-auth-uri';

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
 * @remarks
 * Security: Validates all parameters to prevent injection or invalid configurations.
 * - Algorithm must be SHA-1, SHA-256, or SHA-512
 * - Digits must be 6 or 8
 * - Period must be a positive integer
 * - Label is required per otpauth specification
 *
 * @param uri - OTPAuth URI to parse
 *
 * @throws ({@link InternalError}) - if the URI is invalid or missing required parameters
 *
 * @returns Parsed URI parameters
 */
export const parseOtpAuthUri = (uri: string): Required<Omit<OtpAuthUri, 'issuer'>> & { issuer?: string } => {
	const url = new URL(uri);

	if (url.protocol !== 'otpauth:')
		throw new InternalError(TOTP_ERROR_KEYS.INVALID_OTP_AUTH_URI, 'Invalid protocol, expected otpauth:');

	if (url.hostname !== 'totp')
		throw new InternalError(TOTP_ERROR_KEYS.INVALID_OTP_AUTH_URI, 'Invalid type, expected totp');

	const label = decodeURIComponent(url.pathname.slice(1));

	// Security: Validate label is present (required by otpauth spec)
	if (!label)
		throw new InternalError(TOTP_ERROR_KEYS.MISSING_LABEL, 'Label is required');

	const secretBase32 = url.searchParams.get('secret');

	if (!secretBase32)
		throw new InternalError(TOTP_ERROR_KEYS.MISSING_SECRET, 'Secret is required');

	const issuerParam = url.searchParams.get('issuer');
	const issuer = issuerParam ? decodeURIComponent(issuerParam) : undefined;

	// Security: Validate algorithm
	const algorithmParam = url.searchParams.get('algorithm') || 'SHA-1';
	if (algorithmParam !== 'SHA-1' && algorithmParam !== 'SHA-256' && algorithmParam !== 'SHA-512')
		throw new InternalError(TOTP_ERROR_KEYS.INVALID_ALGORITHM, 'Algorithm must be SHA-1, SHA-256, or SHA-512');
	const algorithm = algorithmParam as HashAlgorithm;

	// Security: Validate digits
	const digitsParam = parseInt(url.searchParams.get('digits') || '6', 10);
	if (digitsParam !== 6 && digitsParam !== 8)
		throw new InternalError(TOTP_ERROR_KEYS.INVALID_DIGITS, 'Digits must be 6 or 8');
	const digits = digitsParam as OtpDigits;

	// Security: Validate period
	const period = parseInt(url.searchParams.get('period') || '30', 10);
	if (!Number.isFinite(period) || period <= 0)
		throw new InternalError(TOTP_ERROR_KEYS.INVALID_PERIOD, 'Period must be a positive integer');

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
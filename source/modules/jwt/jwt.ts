import {
	SignJWT,
	errors,
	jwtVerify,
	type JWTPayload,
	type JWTVerifyResult
} from 'jose';

import { HttpError } from '#/errors/http-error';
import { InternalError } from '#/errors/internal-error';
import { JWT_ERROR_KEYS } from './enums/jwt-error-keys';
import { parseHumanTimeToSeconds } from './utils/parse-human-time-to-seconds';

// Avoid re-instantiation on each call
const _textEncoder = new TextEncoder();

export interface VerifyOptions {
	issuer?: string;
	audience?: string | string[];
}

/**
 * Signs a JWT with the given payload and expiration
 *
 * @param secret - The secret key used for HS256 signing (minimum 32 characters)
 * @param payload - The JWT payload claims
 * @param expiration - Token expiration as seconds offset, Date, or human-readable string (default: 15 minutes)
 *
 * @throws ({@link InternalError}) – If secret is too short, expiration is in the past, or signing fails
 *
 * @returns A Promise resolving to the signed JWT string
 *
 * @example
 * ```typescript
 * const token = await signJWT('my-secret-key-at-least-32-chars!', { userId: 123 }, '1 hour');
 * ```
 */
export const signJWT = (
	secret: string,
	payload: JWTPayload,
	expiration: number | string | Date = 60 * 15 // 15 minutes
): Promise<string> => {
	if (secret.length < 32)
		throw new InternalError(JWT_ERROR_KEYS.JWT_SECRET_TOO_WEAK);

	const nowSeconds = Math.floor(Date.now() / 1000);

	const exp = expiration instanceof Date
		? Math.floor(expiration.getTime() / 1000)
		: typeof expiration === 'number'
			? nowSeconds + expiration
			: nowSeconds + parseHumanTimeToSeconds(expiration);

	if (exp <= nowSeconds)
		throw new InternalError(JWT_ERROR_KEYS.JWT_EXPIRATION_PASSED);

	const finalPayload: JWTPayload = {
		iss: 'Core-Issuer',
		sub: '',
		aud: ['Core-Audience'],
		jti: Bun.randomUUIDv7(),
		nbf: nowSeconds,
		iat: nowSeconds,
		exp,
		...payload
	};

	try {
		return new SignJWT(finalPayload)
			.setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
			.sign(_textEncoder.encode(secret));
	} catch (error) {
		throw new InternalError(JWT_ERROR_KEYS.JWT_SIGN_ERROR, error);
	}
};

/**
 * Verifies a JWT token and throws HttpError on failure
 *
 * @param token - The JWT token string to verify
 * @param secret - The secret key used for HS256 verification
 * @param options - Optional verification options for issuer/audience validation
 *
 * @throws ({@link HttpError}) – 401 if token is expired, invalid signature, malformed, or claim validation fails
 *
 * @returns The verification result with payload and protected header
 *
 * @example
 * ```typescript
 * try {
 *     const result = await verifyJWT(token, secret);
 *     console.log(result.payload);
 * } catch (error) {
 *     // HttpError with appropriate message
 * }
 * ```
 */
export const verifyJWT = async (
	token: string,
	secret: string,
	options?: VerifyOptions
): Promise<JWTVerifyResult> => {
	try {
		return await jwtVerify(token, _textEncoder.encode(secret), {
			algorithms: ['HS256'],
			...(options?.issuer && { issuer: options.issuer }),
			...(options?.audience && { audience: options.audience })
		});
	} catch (error) {
		if (error instanceof errors.JWTExpired)
			throw new HttpError(JWT_ERROR_KEYS.JWT_EXPIRED, 'UNAUTHORIZED', error);
		if (error instanceof errors.JWTClaimValidationFailed)
			throw new HttpError(JWT_ERROR_KEYS.JWT_CLAIM_VALIDATION_FAILED, 'UNAUTHORIZED', error);
		if (error instanceof errors.JWSSignatureVerificationFailed)
			throw new HttpError(JWT_ERROR_KEYS.JWT_INVALID_SIGNATURE, 'UNAUTHORIZED', error);
		if (error instanceof errors.JWTInvalid)
			throw new HttpError(JWT_ERROR_KEYS.JWT_MALFORMED, 'UNAUTHORIZED', error);
		throw new HttpError(JWT_ERROR_KEYS.JWT_VERIFICATION_FAILED, 'UNAUTHORIZED', error);
	}
};

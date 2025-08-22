import {
	SignJWT,
	jwtVerify,
	type JWTPayload,
	type JWTVerifyResult
} from 'jose';

import { HttpError } from '#/errors/httpError';
import { JWT_ERROR_KEYS } from './enums/jwtErrorKeys';
import { parseHumanTimeToSeconds } from './utils/parseHumanTimeToSeconds';

export const signJWT = (
	secret: string,
	payload: JWTPayload,
	expiration: number | string | Date = Math.floor(Date.now() / 1000) + (60 * 15) // Default to 15 minutes
) => {
	const exp = expiration instanceof Date
		? Math.floor(expiration.getTime() / 1000)
		: typeof expiration === 'number'
			? expiration
			: parseHumanTimeToSeconds(expiration);

	if (exp <= Math.floor(Date.now() / 1000))
		throw new HttpError({
			message: JWT_ERROR_KEYS.JWT_EXPIRATION_PASSED,
			httpStatusCode: 'BAD_REQUEST'
		});


	// Prepare the final payload with default claims
	const finalPayload = {
		iss: 'Core-Issuer', // Issuer
		sub: '', // Subject
		aud: ['Core-Audience'], // Audience
		jti: Bun.randomUUIDv7(), // JWT ID
		nbf: Math.floor(Date.now() / 1000), // Not Before (default now)
		iat: Math.floor(Date.now() / 1000), // Issued At
		exp,
		...payload
	};

	try {
		const jwt = new SignJWT(finalPayload)
			.setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
			.setIssuer(finalPayload.iss)
			.setSubject(finalPayload.sub)
			.setAudience(finalPayload.aud)
			.setJti(finalPayload.jti)
			.setNotBefore(finalPayload.nbf)
			.setIssuedAt(finalPayload.iat)
			.setExpirationTime(expiration)
			.sign(new TextEncoder().encode(secret));
		return jwt;
	} catch (error) {
		throw new HttpError({
			message: JWT_ERROR_KEYS.JWT_SIGN_ERROR,
			httpStatusCode: 'INTERNAL_SERVER_ERROR',
			cause: error
		});
	}
};

export const verifyJWT = async (token: string, secret: string): Promise<JWTVerifyResult | false> => {
	try {
		return await jwtVerify(token, new TextEncoder().encode(secret));
	} catch {
		return false;
	}
};


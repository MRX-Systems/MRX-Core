import { Elysia } from 'elysia';
import {
	SignJWT,
	jwtVerify,
	type JWTPayload,
	type JWTVerifyResult
} from 'jose';

import { HttpError } from '#/errors/httpError';
import { JWT_ERROR_KEYS } from './enums/jwtErrorKeys';
import type { JWTOptions } from './types/jwtOptions';

/**
 * The `elysiaJwtPlugin` provides secure JSON Web Token (JWT) authentication capabilities for Elysia applications.
 *
 * This plugin leverages the industry-standard `jose` library to ensure robust JWT handling with modern cryptographic standards.
 *
 * @template TJWTKeyName - The name to use for JWT functionality in the Elysia context (defaults to 'jwt')
 * @param options - Configuration options for the JWT plugin
 *
 * @returns An Elysia plugin that adds JWT functionality to the application context
 *
 * @throws ({@link HttpError}) When the secret key is missing or invalid
 *
 * @example
 * Basic usage
 * ```ts
 * const app = new Elysia()
 *   .use(jwt({
 *     secret: process.env.JWT_SECRET!,
 *     exp: '1h'
 *   }))
 *   .post('/login', ({ jwt }) => {
 *     return jwt.sign({ userId: 123, role: 'user' });
 *   })
 *   .get('/protected', async ({ jwt, headers }) => {
 *     const token = headers.authorization?.replace('Bearer ', '');
 *     const payload = await jwt.verify(token);
 *     if (!payload) throw new Error('Invalid token');
 *     return { user: payload };
 *   });
 * ```
 * @example
 * Custom context key name
 * ```ts
 * const app2 = new Elysia()
 *   .use(jwt({
 *     jwtKeyName: 'auth',
 *     secret: 'my-secret'
 *   }))
 *   .post('/login', ({ auth }) => auth.sign({ id: 1 }));
 * ```
 */
export const jwt = <const TJWTKeyName extends string = 'jwt'>(options: JWTOptions<TJWTKeyName>) => {
	// Validate required configuration
	if (!options.secret)
		throw new HttpError({
			message: JWT_ERROR_KEYS.JWT_SECRET_NOT_FOUND,
			httpStatusCode: 'INTERNAL_SERVER_ERROR'
		});

	// Encode string secret to Uint8Array for cryptographic operations
	const encodedKey: Uint8Array = new TextEncoder().encode(options.secret);

	// Determine the context key name with proper type safety
	const contextKeyName: TJWTKeyName = (options.jwtKeyName ?? 'jwt') as TJWTKeyName;

	// Default algorithm for JWT signing (industry standard)
	const defaultAlgorithm = 'HS256';

	// Default expiration time (balance between security and usability)
	const defaultExpiration = '15m';

	return new Elysia({
		name: 'jwt',
		seed: options
	})
		.decorate(contextKeyName, {
			/**
			 * Signs a JWT with the provided payload and optional expiration time.
			 *
			 * This method creates a new JWT with the specified payload, merging it withrateLimitError
			 * any default payload values configured in the plugin options. The resulting
			 * token includes standard claims and custom data as needed.
			 *
			 * @param additionalPayload - Custom payload data to include in the JWT
			 * @param expiration - Token expiration time (overrides default if provided)
			 *
			 * @returns A Promise that resolves to the signed JWT string
			 *
			 * @throws ({@link HttpError}): When JWT signing fails due to invalid payload or configuration
			 *
			 * @example
			 * Sign with user data
			 * ```ts
			 * const token = await jwt.sign({ userId: 123, role: 'admin' });
			 * ```
			 * @example
			 * Sign with custom expiration
			 * ```ts
			 * const token = await jwt.sign({ userId: 123 }, '2h');
			 * ````
			 * @example
			 * Sign with Date expiration
			 * ```ts
			 * const token = await jwt.sign({ userId: 123 }, new Date('2024-12-31'));
			 * ```
			 */
			async sign(
				additionalPayload?: JWTPayload,
				expiration: number | string | Date = options.exp ?? defaultExpiration
			): Promise<string> {
				// Generate unique JWT ID for tracking and revocation
				const jwtId: string = crypto.randomUUID();

				// Construct comprehensive payload with defaults and custom data
				const finalPayload: JWTPayload = {
					// Standard registered claims with sensible defaults
					iss: 'elysia-jwt-plugin',
					aud: 'elysia-application',
					jti: jwtId,
					iat: Math.floor(Date.now() / 1000), // Issued at (current timestamp)
					// Merge configured default payload
					...options.payload,
					// Apply additional payload (highest priority)
					...additionalPayload
				};

				try {
					// Prepare header parameters, excluding potentially conflicting b64 property
					const headerParams = {
						alg: defaultAlgorithm,
						typ: 'JWT',
						...(options.header
							? Object.fromEntries(
								Object.entries(options.header).filter(([key]) => key !== 'b64')
							)
							: {})
					};

					// Create JWT with comprehensive configuration
					const jwt = new SignJWT(finalPayload)
						.setProtectedHeader(headerParams)
						.setIssuedAt() // Set current timestamp
						.setExpirationTime(expiration);

					// Set issuer and audience if provided in payload
					if (finalPayload.iss)
						jwt.setIssuer(finalPayload.iss);

					if (finalPayload.aud)
						jwt.setAudience(Array.isArray(finalPayload.aud) ? finalPayload.aud : [finalPayload.aud]);

					return await jwt.sign(encodedKey);
				} catch (error: unknown) {
					throw new HttpError({
						message: JWT_ERROR_KEYS.JWT_SIGN_ERROR,
						httpStatusCode: 'INTERNAL_SERVER_ERROR',
						cause: error
					});
				}
			},

			/**
			 * Verifies and decodes a JWT token.
			 *
			 * This method validates the token's signature, expiration, and format.
			 * It returns the decoded payload if the token is valid, or false if
			 * the token is invalid, expired, or malformed.
			 *
			 * @param token - The JWT string to verify and decode
			 *
			 * @returns A Promise that resolves to the decoded payload or false if invalid
			 *
			 * @example
			 * Verify token from Authorization header
			 * ```ts
			 * const token = headers.authorization?.replace('Bearer ', '');
			 * const payload = await jwt.verify(token);
			 *
			 * if (payload) {
			 *   console.log('User ID:', payload.userId);
			 *   console.log('Token expires:', new Date(payload.exp! * 1000));
			 * } else {
			 *   console.log('Invalid or expired token');
			 * }
			 * ```
			 */
			async verify(token?: string): Promise<JWTVerifyResult | false> {
				// Early return for missing or empty tokens
				if (!token || token.trim() === '')
					return false;

				try {
					// Verify token signature and extract payload
					const result = await jwtVerify(token, encodedKey, {
						// Additional verification options can be added here
						algorithms: [defaultAlgorithm]
					});

					return result;
				} catch {
					// Return false for any verification failure (expired, invalid signature, malformed, etc.)
					return false;
				}
			}
		})
		.as('scoped');
};

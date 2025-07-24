import { Elysia } from 'elysia';
import {
	SignJWT,
	jwtVerify,
	type JWTPayload
} from 'jose';

import { CoreError } from '#/error/coreError';
import { errorKeys } from './enums/errorKeys';
import type { JWTOptions } from './types/jwtOptions';

/**
 * The `jwtPlugin` provides JSON Web Token (JWT) authentication capabilities for Elysia applications.
 *
 * The plugin adds two primary methods to your Elysia context:
 * - `sign()`: Generate and sign new JWTs
 * - `verify()`: Validate and decode existing JWTs
 *
 * @template Name - The name to use for JWT functionality in the context (default: 'jwt')
 * @param options - Configuration options for the JWT plugin
 *
 * @returns An Elysia plugin that adds JWT functionality to the application context
 */
export const jwtPlugin = <const Name extends string = 'jwt'>(options: JWTOptions<Name>) => {
	// Check if the secret is provided
	if (!options.secret)
		throw new CoreError({
			key: errorKeys.jwtSecretNotFound,
			message: 'Secret key is required for JWT signing and verification.'
		});

	// Encode string secret to Uint8Array
	const key = new TextEncoder().encode(options.secret);

	// Create name of the decorated key
	const name = options.name ?? 'jwt' as Name;

	return new Elysia({
		name: 'jwtPlugin',
		seed: options
	})
		.decorate(name, {
			sign(
				additionalPayload?: JWTPayload,
				exp: number | string | Date = options.exp ?? '15m'
			) {
				const payload: JWTPayload = {
					iss: 'core',
					aud: 'core client',
					jti: Bun.randomUUIDv7(),
					...options.payload,
					...additionalPayload
				};
				try {
					return new SignJWT(payload)
						.setProtectedHeader({
							alg: 'HS256',
							b64: true
						})
						.setIssuer(payload.iss ?? 'core')
						.setAudience(payload.aud ?? 'client')
						.setExpirationTime(exp)
						.sign(key);
				} catch {
					throw new CoreError({
						key: errorKeys.jwtSignError,
						message: 'Error signing JWT.'
					});
				}
			},

			async verify(jwt?: string): Promise<JWTPayload | false> {
				if (!jwt)
					return false;
				try {
					const data = (await jwtVerify(jwt, key)).payload;
					return data;
				} catch {
					return false;
				}
			}
		})
		.as('scoped');
};

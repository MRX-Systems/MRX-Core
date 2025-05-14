import { Elysia } from 'elysia';
import {
    SignJWT,
    jwtVerify,
    type JWTPayload
} from 'jose';

import { CoreError } from '#/error/coreError';
import { elysiaKeyError } from './enums/elysiaKeyError';
import type { JWTOptions } from './types/jwtOptions';

export const jwtPlugin = <const Name extends string = 'jwt'>(options: JWTOptions<Name>) => {
    // Check if the secret is provided
    if (!options.secret)
        throw new CoreError({
            key: elysiaKeyError.jwtSecretNotFound,
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
                        key: elysiaKeyError.jwtSignError,
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

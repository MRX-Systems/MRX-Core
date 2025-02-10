import type { Static, TSchema } from '@sinclair/typebox';
import { Elysia } from 'elysia';
import {
    SignJWT,
    jwtVerify,
    type JWSHeaderParameters,
    type JWTPayload,
    type KeyLike
} from 'jose';

type UnwrapSchema<
    Schema extends TSchema | undefined,
    Fallback = unknown
> = Schema extends TSchema ? Static<NonNullable<Schema>> : Fallback;

export interface JWTOption<
    Name extends string | undefined = 'jwt',
    Schema extends TSchema | undefined = undefined
> {
    /**
     * JWT Name to add in context with decorate.
     */
    name?: Name;
    /**
    * JWT Secret
    */
    secret: string | Uint8Array | KeyLike;
    /**
    * Type strict validation for JWT payload
    */
    schema?: Schema;
    /**
    * JWT Expiration. You can set the exp globally or in the sign method.
    * You can use string like '15m', '1h', '1d', '1w', '1y' or date or number representing iat (UNIX timestamp).
    *
    * Default is 15 minutes.
    */
    exp?: number | string | Date;
    /**
     * Default header to add in JWT. (alg is HS256 by default)
     */
    header?: JWSHeaderParameters;
    /**
     * Default payload to add in JWT.
     */
    payload?: JWTPayload;
}

export const jwt = <
    const Name extends string = 'jwt',
    const Schema extends TSchema | undefined = undefined
>(options: JWTOption<Name, Schema>) => {
    const key = typeof options.secret === 'string'
        ? new TextEncoder().encode(options.secret)
        : options.secret;

    const name = options.name as Name;
    return new Elysia({
        name: 'jwtPlugin',
        seed: {
            name: options.name
        }
    })
        .decorate(name ?? 'jwt', {
            /**
             * Sign JWT with additional payload and expiration time.
             *
             * @param additionalPayload - Additional payload to add in JWT.
             * @param exp - Expiration time. You can use string like '15m', '1h', '1d', '1w', '1y' or date or number representing iat (UNIX timestamp). Default is 15 minutes.
             */
            sign(
                additionalPayload: UnwrapSchema<Schema, Record<string, string | number>> & JWTPayload,
                exp: number | string | Date = options.exp ?? '15m'
            ) {
                const jwt = new SignJWT({ ...options.payload, ...additionalPayload })
                    .setProtectedHeader({
                        alg: options.header?.alg ?? 'HS256',
                        ...options.header,
                        b64: true
                    })

                    .setIssuer(options.payload?.iss ?? additionalPayload.iss ?? 'core')
                    .setAudience(options.payload?.aud ?? additionalPayload.aud ?? 'client')
                    .setExpirationTime(exp)
                    .sign(key);
                return jwt;
            },
            /**
             * Verify JWT and return payload if valid.
             *
             * @param jwt - JWT to verify.
             *
             * @returns Payload if valid, otherwise false.
             */
            async verify(jwt?: string): Promise<(UnwrapSchema<Schema, Record<string, string | number>> & JWTPayload) | false> {
                if (!jwt)
                    return false;
                try {
                    const data = (await jwtVerify(jwt, key)).payload;
                    return data as UnwrapSchema<Schema, Record<string, string | number>> & JWTPayload;
                } catch {
                    return false;
                }
            }
        });
};
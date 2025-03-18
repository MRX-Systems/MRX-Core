import type { Static, TSchema } from '@sinclair/typebox';
import { Elysia } from 'elysia';
import {
    SignJWT,
    jwtVerify,
    type JWSHeaderParameters,
    type JWTPayload
} from 'jose';

/**
 * Utility type for unwrapping TypeBox schemas into their TypeScript equivalents.
 * If no schema is provided, falls back to a default type.
 *
 * @typeParam Schema - The TypeBox schema to unwrap
 * @typeParam Fallback - The fallback type to use if no schema is provided
 *
 * @internal
 */
type UnwrapSchema<
    Schema extends TSchema | undefined,
    Fallback = unknown
> = Schema extends TSchema ? Static<NonNullable<Schema>> : Fallback;

/**
 * Configuration options for the JWT plugin.
 *
 * @typeParam Name - The name to be used for accessing the JWT functionality in the Elysia context
 * @typeParam Schema - Optional TypeBox schema to type-check JWT payloads
 */
export interface JWTOption<
    Name extends string | undefined = 'jwt',
    Schema extends TSchema | undefined = undefined
> {
    /**
     * JWT name to add in context with decorate.
     * This will be the property name used to access JWT functionality.
     *
     * @defaultValue 'jwt'
     */
    name?: Name;

    /**
     * Secret key used to sign and verify JWTs.
     * Can be provided as a string or a Uint8Array.
     *
     * @example
     * ```typescript
     * // Using a string secret
     * secret: 'your-very-secret-key'
     *
     * // Using a Uint8Array
     * secret: new Uint8Array([1, 2, 3, 4, 5])
     * ```
     */
    secret: string | Uint8Array;

    /**
     * TypeBox schema for validating JWT payload structure.
     * When provided, enables strong typing for JWT payloads.
     *
     * @example
     * ```typescript
     * import { t } from 'elysia'
     *
     * schema: t.Object({
     *   userId: t.Number(),
     *   role: t.String(),
     *   permissions: t.Array(t.String())
     * })
     * ```
     */
    schema?: Schema;

    /**
     * JWT expiration setting. Applies as the default expiration for tokens.
     *
     * Can be specified as:
     * - String duration (e.g. '15m', '1h', '1d', '1w', '1y')
     * - Date object (specific expiration date)
     * - Number (UNIX timestamp in seconds)
     *
     * @defaultValue '15m' (15 minutes)
     *
     * @example
     * ```typescript
     * // 1 hour expiration
     * exp: '1h'
     *
     * // Specific date
     * exp: new Date('2023-12-31')
     *
     * // UNIX timestamp
     * exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour from now
     * ```
     */
    exp?: number | string | Date;

    /**
     * Default JWT header parameters.
     * The 'alg' property defaults to 'HS256' if not specified.
     *
     * @example
     * ```typescript
     * header: {
     *   alg: 'HS256',
     *   typ: 'JWT'
     * }
     * ```
     */
    header?: JWSHeaderParameters;

    /**
     * Default payload values to include in every JWT.
     * These values will be merged with any additional payload provided during signing.
     *
     * @example
     * ```typescript
     * payload: {
     *   iss: 'my-api',
     *   aud: 'my-frontend'
     * }
     * ```
     */
    payload?: JWTPayload;
}

/**
 * The `jwtPlugin` provides JSON Web Token (JWT) authentication capabilities for Elysia applications.
 *
 * This plugin simplifies the process of generating and verifying JWTs with strong typing support
 * through TypeBox schemas. It leverages the jose library for secure token handling and integrates
 * seamlessly with Elysia's context system.
 *
 * ### Key Features:
 * - **Type-safe JWT Generation**: Create tokens with payload validation via TypeBox schemas
 * - **Flexible Token Configuration**: Customize token expiration, headers, and default payload values
 * - **Simple Verification API**: Easy-to-use methods for validating tokens
 * - **Strong TypeScript Integration**: Full type inference for JWT payloads
 *
 * ### Overview:
 * @example
 * ```typescript
 * import { Elysia, t } from 'elysia';
 * import { jwtPlugin } from './jwtPlugin';
 *
 * // Define a schema for your JWT payload
 * const userSchema = t.Object({
 *   userId: t.Number(),
 *   username: t.String(),
 *   role: t.String()
 * });
 *
 * // Set up JWT plugin with the schema
 * const app = new Elysia()
 *   .use(jwtPlugin({
 *     name: 'auth',
 *     secret: process.env.JWT_SECRET || 'supersecret',
 *     schema: userSchema,
 *     exp: '1d',
 *     payload: {
 *       iss: 'my-api',
 *       aud: 'my-frontend'
 *     }
 *   }))
 *   .post('/login', async ({ auth, body }) => {
 *     // Authenticate user from body...
 *     // If valid, sign a token
 *     const token = await auth.sign({
 *       userId: 123,
 *       username: 'john.doe',
 *       role: 'admin'
 *     });
 *
 *     return { token };
 *   })
 *   .get('/profile', async ({ auth, request, set }) => {
 *     // Extract Bearer token
 *     const authHeader = request.headers.get('authorization');
 *     const token = authHeader?.split(' ')[1];
 *
 *     // Verify the token
 *     const payload = await auth.verify(token);
 *
 *     if (!payload) {
 *       set.status = 401;
 *       return { error: 'Unauthorized' };
 *     }
 *
 *     // Token is valid, payload is fully typed
 *     return {
 *       userId: payload.userId,
 *       username: payload.username,
 *       role: payload.role
 *     };
 *   })
 *   .listen(3000);
 * ```
 *
 * @typeParam Name - The name to use for JWT functionality in the context (default: 'jwt')
 * @typeParam Schema - Optional TypeBox schema to type-check JWT payloads
 * @param options - Configuration options for the JWT plugin
 *
 * @returns An Elysia application instance with JWT functionality added to the context
 */
export const jwtPlugin = <
    const Name extends string = 'jwt',
    const Schema extends TSchema | undefined = undefined
>(options: JWTOption<Name, Schema>): typeof plugin => {
    const key = typeof options.secret === 'string'
        ? new TextEncoder().encode(options.secret)
        : options.secret;

    const name = options.name as Name;
    const plugin = new Elysia({
        name: 'jwtPlugin',
        seed: {
            name: options.name
        }
    })
        .decorate(name ?? 'jwt', {
            /**
             * Sign a new JWT with the provided payload and configuration.
             *
             * This method creates a JSON Web Token by merging the provided payload
             * with any default payload values configured in the plugin options.
             * The resulting token is signed using the configured secret key.
             *
             * @param additionalPayload - Payload data to include in the JWT ({@link JWTPayload})
             * @param exp - Token expiration time. Can be:
             *   - A string duration (e.g., '15m', '1h', '1d')
             *   - A Date object representing the exact expiration time
             *   - A number representing a UNIX timestamp in seconds
             *
             * @defaultValue options.exp ?? '15m'
             *
             * @returns A Promise resolving to the signed JWT string
             *
             * @example
             * ```typescript
             * // Basic signing with default expiration
             * const token = await jwt.sign({ userId: 123 });
             *
             * // Signing with a specific expiration
             * const token = await jwt.sign({ userId: 123 }, '1d');
             *
             * // Signing with a specific date
             * const token = await jwt.sign({ userId: 123 }, new Date('2023-12-31'));
             * ```
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
             * Verify a JWT and extract its payload if valid.
             *
             * This method validates that the token:
             * - Was signed with the correct secret key
             * - Has not expired
             * - Has not been tampered with
             *
             * If validation succeeds, the decoded payload is returned with full type information
             * based on the schema provided in plugin options.
             *
             * @param jwt - The JWT string to verify
             *
             * @returns A Promise resolving to either:
             *   - The decoded payload if verification succeeds
             *   - `false` if verification fails or no token is provided
             *
             * @example
             * ```typescript
             * // Extract token from Authorization header
             * const authHeader = request.headers.get('authorization');
             * const token = authHeader?.split(' ')[1];
             *
             * // Verify the token
             * const payload = await jwt.verify(token);
             *
             * if (payload) {
             *   // Token is valid, payload is fully typed
             *   console.log(`User ID: ${payload.userId}`);
             * } else {
             *   // Token is invalid or missing
             *   console.log('Authentication failed');
             * }
             * ```
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
        })
        .as('plugin');
    return plugin;
};
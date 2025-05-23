import type {
    JWSHeaderParameters,
    JWTPayload
} from 'jose';

/**
 * Configuration options for the JWT plugin.
 *
 * @template TPluginName - The name to be used for accessing the JWT functionality in the Elysia context
 *
 * @example
 * ```typescript
 * const options: JWTOption = {
 *   name: 'auth',
 *   secret: process.env.JWT_SECRET || 'your-secret-key',
 *   exp: '1d',
 *   header: {
 *     alg: 'HS256',
 *     typ: 'JWT'
 *   },
 *   payload: {
 *     iss: 'my-api',
 *     aud: 'my-client'
 *   }
 * };
 * ```
 */
export interface JWTOptions<TPluginName extends string | undefined = 'jwt'> {
    /**
     * JWT name to add in context with decorate.
     *
     * This allows you to customize how you access the JWT functionality in your
     * route handlers. For example, if set to 'auth', you would use `auth.sign()`
     * instead of the default `jwt.sign()`.
     *
     * @defaultValue 'jwt'
     */
    name?: TPluginName;
    /**
     * Secret key used to sign and verify JWTs.
     *
     * @example
     * ```typescript
     * // Using a string secret
     * secret: 'your-very-secret-key'
     *
     * // Using an environment variable (recommended for production)
     * secret: process.env.JWT_SECRET
     * ```
     */
    secret: string;
    /**
     * JWT expiration setting. Applies as the default expiration for tokens.
     *
     * Controls how long tokens are valid before they expire. This setting provides
     * a good balance between security (limiting the window of opportunity for token misuse)
     * and user experience (not requiring frequent re-authentication).
     *
     * @defaultValue '15m' (15 minutes)
     *
     * @example
     * ```typescript
     * // Set tokens to expire after 1 hour
     * exp: '1h'
     *
     * // Set tokens to expire at a specific date
     * exp: new Date('2023-12-31')
     *
     * // Set tokens to expire after 3600 seconds (1 hour)
     * exp: 3600
     * ```
     */
    exp?: number | string | Date;
    /**
     * Default JWT header parameters to include in every JWT.
     *
     * This allows you to specify additional metadata about the token.
     */
    header?: JWSHeaderParameters;
    /**
     * Default payload values to include in every JWT.
     *
     * These values are merged with any additional payload provided during signing,
     * allowing you to set standard claims that should be included in all tokens
     * generated by your application.
     *
     * @example
     * ```typescript
     * payload: {
     *   iss: 'my-api',           // Issuer
     *   aud: 'my-frontend',      // Audience
     * }
     * ```
     */
    payload?: JWTPayload;
}

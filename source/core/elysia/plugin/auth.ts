import { randomBytes } from 'crypto';
import { Elysia, type Cookie } from 'elysia';

import {
    loginBodySchema,
    loginMfaBodySchema,
    loginMfaResponse200Schema,
    loginResponse200Schema,
    loginResponse400Schema
} from '#/core/elysia/schema/login';
import type { Redis } from '#/core/store/redis';
import { CoreError } from '#/error/coreError';
import { ELYSIA_KEY_ERROR } from '#/error/key/elysiaKeyError';
import { HTTP_STATUS_CODE } from '#/types/enum/httpStatusCode';
import { jwtPlugin } from './jwt';

/**
 * Authentication options to be used in the auth plugin.
 *
 * This interface defines the configuration required to set up
 * the authentication plugin for Elysia.
 */
export interface AuthOptions {
    cookieConfig?: {
        /**
         * The secret key for the cookie. (Default: random UUID v7)
         */
        secrets?: string;
    };

    /**
     * JWT configuration settings for token generation.
     */
    jwtConfig: {
        /**
         * The secret key for signing and verifying JWTs.
         * This should be a strong, unique value kept safe from exposure.
         */
        secret: string;

        /**
         * The expiration time for access tokens.
         * Can be specified as string like '15m', '1h', '1d', '1w', '1y',
         * a Date object, or a number representing a UNIX timestamp in seconds.
         */
        accessTokenExpiration: number | string | Date;

        /**
         * The expiration time for refresh tokens.
         * Can be specified as string like '15m', '1h', '1d', '1w', '1y',
         * a Date object, or a number representing a UNIX timestamp in seconds.
         *
         * It's recommended to set this longer than the access token expiration.
         */
        refreshTokenExpiration: number | string | Date;

        /**
         * The issuer of the JWT. (Default: Core)
         *
         * This identifies the principal that issued the JWT.
         */
        issuer?: string;

        /**
         * The audience of the JWT. (Default: Core User)
         *
         * This identifies the recipients that the JWT is intended for.
         */
        audience?: string;
    };

    /**
     * Multi-factor authentication (MFA) configuration.
     */
    mfaConfig: {
        /**
         * Determines if MFA is enabled for users.
         *
         * - If a boolean, applies the same setting to all users
         * - If a function, dynamically determines MFA requirement based on email
         *
         * @defaultValue false
         */
        isEnable?: boolean | ((email: string) => Promise<boolean> | boolean);

        /**
         * Function to handle sending MFA tokens to users.
         *
         * Implement this to deliver tokens via email, SMS, or other channels.
         *
         * @param email - The email of the user
         * @param token - The generated MFA token
         * @param expireTime - The expiration time of the token in seconds
         */
        sendToken?: (email: string, token: string, expireTime: number) => Promise<void> | void;

        /**
         * The expiration time of the MFA token in seconds.
         *
         * @defaultValue 900 (15 minutes)
         */
        expireTime?: number;
    }

    /**
     * Function to validate user credentials during login.
     *
     * This function should retrieve user information and verify the provided password.
     *
     * @param email - The email of the user attempting to login
     * @param password - The password provided during login attempt
     *
     * @returns A boolean or Promise<boolean> indicating if credentials are valid
     */
    loginUseCase: (email: string, password: string) => Promise<boolean> | boolean;

    /**
     * The Redis instance used to store MFA and refresh tokens.
     *
     * This is required for token management and session handling.
     */
    redis: Redis
}

/**
 * The `authPlugin` creates an authentication system for Elysia applications.
 *
 * This plugin provides comprehensive authentication functionality including:
 * - User login with password verification
 * - JWT-based authentication with access and refresh tokens
 * - Optional Multi-Factor Authentication (MFA)
 * - Secure cookie handling for token storage
 * - Automatic token refresh when access tokens expire
 *
 * ### Key Features:
 * - Access and refresh token management using JWT
 * - Configurable token expiration times
 * - Optional MFA support with customizable token delivery
 * - Redis-backed token storage for revocation support
 * - Secure cookie handling with signed cookies
 *
 * ### Overview:
 * @example
 * ```typescript
 * import { Elysia } from 'elysia';
 * import { authPlugin } from './authPlugin';
 * import { Redis } from './redis';
 *
 * // Create a Redis instance
 * const redis = new Redis({
 *   host: 'localhost',
 *   port: 6379
 * });
 *
 * // Set up authentication plugin
 * const app = new Elysia()
 *   .use(authPlugin({
 *     jwtConfig: {
 *       secret: process.env.JWT_SECRET || 'supersecret',
 *       accessTokenExpiration: '15m',
 *       refreshTokenExpiration: '7d'
 *     },
 *     mfaConfig: {
 *       isEnable: async (email) => {
 *         // Check if user has MFA enabled in database
 *         return email.endsWith('@admin.com');
 *       },
 *       sendToken: async (email, token, expireTime) => {
 *         // Send token via email or SMS
 *         console.log(`Sending token ${token} to ${email}`);
 *         await sendEmail(email, `Your verification code: ${token}`);
 *       }
 *     },
 *     loginUseCase: async (email, password) => {
 *       // Verify credentials against database
 *       const user = await db.users.findOne({ email });
 *       if (!user) return false;
 *
 *       return await verifyPassword(password, user.passwordHash);
 *     },
 *     redis: redis
 *   }))
 *   .get('/protected', ({ auth }) => {
 *     return { message: `Hello, ${auth.email}!` };
 *   }, {
 *     isAuth: true // Protected route requiring authentication
 *   })
 *   .listen(3000);
 * ```
 *
 * @param options - Configuration options for the auth plugin
 * @returns An Elysia application instance with authentication routes and middleware
 */
export const authPlugin = (options: AuthOptions): typeof app => {
    /**
     * Set the cookie with the value.
     *
     * Configures cookie with security settings based on environment.
     *
     * @param cookie - The cookie to set
     * @param value - The value to set in the cookie
     */
    const setCookie = <T>(cookie: Cookie<string | undefined>, value: T): void => {
        cookie.set({
            secrets: options.cookieConfig?.secrets ?? Bun.randomUUIDv7(),
            sameSite: Bun.env.NODE_ENV === 'production' ? 'none' : 'lax',
            httpOnly: true,
            secure: Bun.env.NODE_ENV === 'production',
            value
        });
    };

    /**
     * Generate a secure random MFA token.
     *
     * Creates a hexadecimal token using cryptographic random bytes.
     *
     * @returns A secure random string to be used as MFA token
     */
    const generateMfaToken = (): string => {
        const token = randomBytes(8).toString('hex');
        const hasher = new Bun.CryptoHasher('blake2b256');
        hasher.update(token);
        return token;
    };

    /**
     * Store the refresh token in Redis.
     *
     * Stores the token using a hash structure for efficient lookup and revocation.
     *
     * @param email - The email of the user (used as key prefix)
     * @param token - The refresh token to store
     * @param tokenJti - The JWT ID used to uniquely identify this token
     * @param redis - The Redis instance for storage
     */
    const storeToken = async (email: string, token: string, tokenJti: string, redis: Redis): Promise<void> => {
        await redis.client.hset(`refresh:${email}`, tokenJti, token);
    };

    /**
     * Store the MFA token in Redis with expiration.
     *
     * Stores a hashed version of the token for secure verification.
     *
     * @param email - The email of the user
     * @param token - The MFA token to store
     * @param redis - The Redis instance for storage
     */
    const storeMfaToken = async (email: string, token: string, redis: Redis): Promise<void> => {
        const hasher = new Bun.CryptoHasher('blake2b256');
        hasher.update(token);
        await redis.client.set(`mfa:${email}`, hasher.digest('hex'), 'EX', options.mfaConfig?.expireTime || 900);
    };

    /**
     * Verify the MFA token against the stored value.
     *
     * Hashes the provided token and compares it with the stored hash.
     *
     * @param email - The email of the user
     * @param token - The MFA token to verify
     * @param redis - The Redis instance for retrieval
     *
     * @returns Boolean indicating if the token is valid
     */
    const verifyMfaToken = async (email: string, token: string, redis: Redis): Promise<boolean> => {
        const hasher = new Bun.CryptoHasher('blake2b256');
        hasher.update(token);
        const value = await redis.client.get(`mfa:${email}`);
        return value === hasher.digest('hex');
    };

    const app = new Elysia({
        name: 'authPlugin',
        prefix: '/auth',
        detail: {
            tags: ['Auth']
        },
        cookie: {
            secrets: options.cookieConfig?.secrets ?? Bun.randomUUIDv7(),
            sign: true
        }
    })
        .use(jwtPlugin({
            secret: options.jwtConfig.secret
        }))
        .state({
            redis: options.redis
        })
        .macro({
            /**
             * Authentication macro to protect routes.
             *
             * This macro verifies that the user is authenticated by checking:
             * 1. First tries to validate the access token
             * 2. If access token is invalid/expired, tries to use refresh token
             * 3. If refresh token is valid, generates new tokens
             *
             * When used as a decorator on a route, it ensures the route is only
             * accessible to authenticated users and provides user information.
             */
            isAuth: {
                async beforeHandle({ jwt, cookie: { accessToken, refreshToken }, store: { redis } }) {
                    if (!accessToken.value || !refreshToken.value)
                        throw new CoreError({
                            key: ELYSIA_KEY_ERROR.UNAUTHORIZED,
                            message: 'Unauthorized',
                            httpStatusCode: HTTP_STATUS_CODE.UNAUTHORIZED
                        });

                    // Verify the access token
                    const accessPayload = await jwt.verify(accessToken.value);
                    if (accessPayload)
                        return;

                    // Invalid or expired access token, trying with the refresh token
                    const refreshPayload = await jwt.verify(refreshToken.value) as { sub: string, jti: string } | null;
                    if (!refreshPayload)
                        throw new CoreError({
                            key: ELYSIA_KEY_ERROR.UNAUTHORIZED,
                            message: 'Unauthorized',
                            httpStatusCode: HTTP_STATUS_CODE.UNAUTHORIZED
                        });

                    // Verify that the refresh token is stored in Redis
                    const storedRefreshToken = await redis.client.hget(`refresh:${refreshPayload.sub}`, refreshPayload.jti ?? '');
                    if (!storedRefreshToken || storedRefreshToken !== refreshToken.value)
                        throw new CoreError({
                            key: ELYSIA_KEY_ERROR.UNAUTHORIZED,
                            message: 'Unauthorized',
                            httpStatusCode: HTTP_STATUS_CODE.UNAUTHORIZED
                        });

                    // Remove the stored refresh token
                    await redis.client.hdel(`refresh:${refreshPayload.sub}`, refreshPayload.jti);

                    // Generate new token
                    const refreshTokenJti = Bun.randomUUIDv7();
                    const [rawAccessToken, rawRefreshToken] = await Promise.all([
                        jwt.sign({
                            iss: options.jwtConfig.issuer ?? 'Core',
                            aud: options.jwtConfig.audience ?? 'Core User',
                            sub: refreshPayload.sub
                        }, options.jwtConfig.accessTokenExpiration),
                        jwt.sign({
                            iss: options.jwtConfig.issuer ?? 'Core',
                            aud: options.jwtConfig.audience ?? 'Core User',
                            sub: refreshPayload.sub,
                            jti: refreshTokenJti
                        }, options.jwtConfig.refreshTokenExpiration)
                    ]);

                    // Store the refresh token in Redis
                    await storeToken(refreshPayload.sub, rawRefreshToken, refreshTokenJti, redis);

                    // Set the refresh token in Redis
                    setCookie(accessToken, rawAccessToken);
                    setCookie(refreshToken, rawRefreshToken);
                },

                resolve({ cookie: { accessToken } }) {
                    if (!accessToken.value) return {};
                    const payload: { sub: string } = JSON.parse(Buffer.from(accessToken.value.split('.')[1], 'base64').toString());
                    return {
                        email: payload.sub
                    };
                }
            }
        })

        .get('/logout', async ({ cookie: { accessToken, refreshToken }, store: { redis } }) => {
            accessToken.remove();
            const payload = JSON.parse(atob(refreshToken.value?.split('.')[1] ?? '')) as { sub: string, jti: string };
            await redis.client.hdel(`refresh:${payload.sub}`, payload.jti);
            refreshToken.remove();

            return {
                message: 'Logout success'
            };
        }, {
            isAuth: true
        })

        .model({
            loginBody: loginBodySchema,
            loginResponse200: loginResponse200Schema,
            loginResponse400: loginResponse400Schema,
            loginMfaBody: loginMfaBodySchema,
            loginMfaResponse200: loginMfaResponse200Schema
        })

        .post('/login', async ({ body: { email, password }, store: { redis }, jwt, cookie: { accessToken, refreshToken } }) => {
            // Check if the credentials are correct
            if (!(await options.loginUseCase(email, password)))
                throw new CoreError({
                    key: ELYSIA_KEY_ERROR.WRONG_EMAIL_OR_PASSWORD,
                    message: 'Invalid email or password',
                    httpStatusCode: HTTP_STATUS_CODE.BAD_REQUEST
                });

            // Check if the MFA is enabled for the user and send the MFA token
            if (typeof options.mfaConfig.isEnable === 'function' ? await options.mfaConfig.isEnable(email) : options.mfaConfig.isEnable) {
                const token = generateMfaToken();
                await storeMfaToken(email, token, redis);
                if (options.mfaConfig.sendToken)
                    await options.mfaConfig.sendToken(email, token, options.mfaConfig?.expireTime || 900);
                return {
                    message: 'MFA required, a code is sent'
                };
            }

            // Generate Token
            const refreshTokenJti = Bun.randomUUIDv7();
            const [rawAccessToken, rawRefreshToken] = await Promise.all([
                jwt.sign({
                    iss: options.jwtConfig.issuer ?? 'Core',
                    aud: options.jwtConfig.audience ?? 'Core User',
                    sub: email
                }, options.jwtConfig.accessTokenExpiration),
                jwt.sign({
                    iss: options.jwtConfig.issuer ?? 'Core',
                    aud: options.jwtConfig.audience ?? 'Core User',
                    sub: email,
                    jti: refreshTokenJti
                }, options.jwtConfig.refreshTokenExpiration)
            ]);

            // Store the refresh token in Redis
            await storeToken(email, rawRefreshToken, refreshTokenJti, redis);

            // Set the refresh token in Redis
            setCookie(accessToken, rawAccessToken);
            setCookie(refreshToken, rawRefreshToken);

            return {
                message: 'Login success'
            };
        }, {
            body: 'loginBody',
            response: {
                200: 'loginResponse200',
                400: 'loginResponse400'
            }
        });

    if (options.mfaConfig.isEnable)
        app.post('/login/mfa', async ({ body: { token, email }, jwt, cookie: { accessToken, refreshToken }, store: { redis } }) => {
            // Verify the MFA token by email and token in Redis
            if (!await verifyMfaToken(email, token, redis))
                throw new CoreError({
                    key: ELYSIA_KEY_ERROR.WRONG_MFA,
                    message: 'Invalid MFA token',
                    httpStatusCode: HTTP_STATUS_CODE.BAD_REQUEST
                });

            // Remove the MFA token
            await redis.client.del(`mfa:${email}`);

            // Generate Token
            const refreshTokenJti = Bun.randomUUIDv7();
            const [rawAccessToken, rawRefreshToken] = await Promise.all([
                jwt.sign({
                    iss: options.jwtConfig.issuer ?? 'Core',
                    aud: options.jwtConfig.audience ?? 'Core User',
                    sub: email
                }, options.jwtConfig.accessTokenExpiration),
                jwt.sign({
                    iss: options.jwtConfig.issuer ?? 'Core',
                    aud: options.jwtConfig.audience ?? 'Core User',
                    sub: email,
                    jti: refreshTokenJti
                }, options.jwtConfig.refreshTokenExpiration)
            ]);

            // Store the refresh token in Redis
            await storeToken(email, rawRefreshToken, refreshTokenJti, redis);

            // Set the refresh token in Redis
            setCookie(accessToken, rawAccessToken);
            setCookie(refreshToken, rawRefreshToken);

            return {
                message: 'MFA success and login success'
            };
        }, {
            body: 'loginMfaBody',
            response: {
                200: 'loginMfaResponse200'
            }
        });
    return app;
};

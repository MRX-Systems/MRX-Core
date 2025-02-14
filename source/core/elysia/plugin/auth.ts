import { randomBytes } from 'crypto';
import { type Cookie, Elysia } from 'elysia';

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
 */
interface AuthOptions {
    /**
     * The expiration time.
     * You can use string like '15m', '1h', '1d', '1w', '1y' or date or number representing iat (UNIX timestamp).
     */
    accessTokenExpiration: number | string | Date;
    /**
     * The expiration time of the refresh token.
     * You can use string like '15m', '1h', '1d', '1w', '1y' or date or number representing iat (UNIX timestamp).
     */
    refreshTokenExpiration: number | string | Date;
    /**
     * The secret key for the cookie.
     */
    cookieSecret: string;
    /**
     * The secret key for the JWT.
     */
    jwtSecret: string;
    /**
     * The login use case is a function that handles the login process, get the user and check the password.
     *
     * @param email - The email of the user.
     * @param password - The password of the user.
     *
     * @returns true if the credentials are correct, false otherwise.
     */
    loginUseCase: (email: string, password: string) => Promise<boolean> | boolean;
    /**
     * The redis options to store the MFA token and Refresh token.
     */
    redis: Redis
    /**
     * The MFA options.
     */
    mfa: {
        /**
         * The function that checks if the MFA is enabled for the user. If it returns true, the MFA will be enabled. (Default: false)
         */
        isEnable?: boolean | ((email: string) => Promise<boolean> | boolean);
        /**
         * The function that sends the token to the user.
         *
         * @param email - The email of the user.
         * @param token - The MFA token.
         * @param expireTime - The expiration time of the MFA token in seconds.
         */
        sendToken?: (email: string, token: string, expireTime: number) => Promise<void> | void;
        /**
         * The expiration time of the MFA token in seconds. (Default: 900 (15 minutes))
         */
        expireTime?: number;
    }
}

export const authPlugin = (options: AuthOptions): typeof app => {
    /**
     * Set the cookie with the value.
     *
     * @param cookie - The cookie to set.
     * @param value - The value to set.
     */
    const setCookie = <T>(cookie: Cookie<string | undefined>, value: T): void => {
        cookie.set({
            secrets: options.cookieSecret,
            sameSite: Bun.env.NODE_ENV === 'production' ? 'none' : 'lax',
            httpOnly: true,
            secure: Bun.env.NODE_ENV === 'production',
            value
        });
    };

    /**
     * Generate access token and refresh token and store the refresh token in Redis.
     *
     * @param email - The email of the user.
     * @param redis - The Redis instance.
     * @param sign - The sign function to sign the token.
     *
     * @returns The access token, refresh token and refresh token JTI.
     */
    const generateTokens = async (
        email: string,
        redis: Redis,
        sign: (payload: Record<string, string | number>, exp: number | string | Date) => Promise<string>
    ): Promise<{
        accessToken: string;
        refreshToken: string;
        refreshTokenJti: string;
    }> => {
        const refreshTokenJti = Bun.randomUUIDv7();
        const [accessToken, refreshToken] = await Promise.all([
            sign({
                iss: 'MRX System',
                aud: 'MRX User',
                sub: email
            }, options.accessTokenExpiration),
            sign({
                iss: 'MRX System',
                aud: 'MRX User',
                sub: email,
                jti: refreshTokenJti
            }, options.refreshTokenExpiration)
        ]);
        await redis.client.hset(`refresh:${email}`, refreshTokenJti, refreshToken);
        return { accessToken, refreshToken, refreshTokenJti };
    };

    /**
     * Verify the MFA token.
     *
     * @param email - The email of the user.
     * @param token - The MFA token.
     * @param redis - The Redis instance.
     *
     * @returns true if the MFA token is valid, false otherwise.
     */
    const verifyMfaToken = async (email: string, token: string, redis: Redis): Promise<boolean> => {
        const hasher = new Bun.CryptoHasher('blake2b256');
        hasher.update(token);
        const value = await redis.client.get(`mfa:${email}`);
        return value === hasher.digest('hex');
    };

    /**
     * Generate MFA token and store it in Redis.
     *
     * @param email - The email of the user.
     * @param redis - The Redis instance.
     *
     * @returns The MFA token.
     */
    const generateMfaToken = async (email: string, redis: Redis): Promise<string> => {
        const token = randomBytes(8).toString('hex');
        const hasher = new Bun.CryptoHasher('blake2b256');
        hasher.update(token);
        const tokenHash = hasher.digest('hex');
        await redis.client.set(`mfa:${email}`, tokenHash, 'EX', options.mfa?.expireTime || 900);
        return token;
    };

    const app = new Elysia({
        name: 'authPlugin',
        prefix: '/auth',
        detail: {
            tags: ['Auth']
        },
        cookie: {
            secrets: options.cookieSecret,
            sign: true
        }
    })
        .use(jwtPlugin({
            secret: options.jwtSecret
        }))
        .state({
            redis: options.redis
        })
        .macro({
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

                    // Generate new tokens
                    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateTokens(refreshPayload.sub, redis, jwt.sign.bind(jwt));

                    // Update cookies with the new tokens
                    setCookie(accessToken, newAccessToken);
                    setCookie(refreshToken, newRefreshToken);
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

        .post('/login', async ({ body, store: { redis }, jwt, cookie: { accessToken, refreshToken } }) => {
            if (!(await options.loginUseCase(body.email, body.password)))
                throw new CoreError({
                    key: ELYSIA_KEY_ERROR.WRONG_EMAIL_OR_PASSWORD,
                    message: 'Invalid email or password',
                    httpStatusCode: HTTP_STATUS_CODE.BAD_REQUEST
                });

            if (typeof options.mfa.isEnable === 'function' ? await options.mfa.isEnable(body.email) : options.mfa.isEnable) {
                const token = await generateMfaToken(body.email, redis);
                if (options.mfa.sendToken)
                    await options.mfa.sendToken(body.email, token, options.mfa?.expireTime || 900);
                return {
                    message: 'MFA required, a code is sent'
                };
            }
            const { accessToken: accessTokenValue, refreshToken: refreshTokenValue } = await generateTokens(body.email, redis, jwt.sign.bind(jwt));
            setCookie(accessToken, accessTokenValue);
            setCookie(refreshToken, refreshTokenValue);

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

    if (options.mfa.isEnable)
        app.post('/login/mfa', async ({ body, jwt, cookie: { accessToken, refreshToken }, store: { redis } }) => {
            const { token, email } = body;

            if (!await verifyMfaToken(email, token, redis))
                throw new CoreError({
                    key: ELYSIA_KEY_ERROR.WRONG_MFA,
                    message: 'Invalid MFA token',
                    httpStatusCode: HTTP_STATUS_CODE.BAD_REQUEST
                });
            await redis.client.del(`mfa:${email}`);
            const { accessToken: accessTokenValue, refreshToken: refreshTokenValue } = await generateTokens(email, redis, jwt.sign.bind(jwt));
            setCookie(accessToken, accessTokenValue);
            setCookie(refreshToken, refreshTokenValue);

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

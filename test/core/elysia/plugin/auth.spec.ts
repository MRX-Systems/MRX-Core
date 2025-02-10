import { afterEach, describe, expect, mock, test } from 'bun:test';
import { Elysia } from 'elysia';

import { authPlugin } from '#/core/elysia/plugin/auth';
import { errorPlugin } from '#/core/elysia/plugin/error';
import { Redis } from '#/core/store/redis';

const redis = {
    host: process.env.STORE_HOST ?? '',
    password: process.env.STORE_KEY ?? '',
    port: parseInt(process.env.STORE_PORT ?? ''),
    tls: {}
};

const password1 = await Bun.password.hash('T€st1!@#0');
const password2 = await Bun.password.hash('T€st2!@#0');

function fakeGetUser(email: string): { password: string, mfa: boolean } | undefined {
    const fakeUser: Record<string, { password: string, mfa: boolean }> = {
        'test1@example.com': {
            password: password1,
            mfa: false
        },
        'test2@example.com': {
            password: password2,
            mfa: true
        }
    };

    return fakeUser[email] ?? undefined;
}

export async function loginUseCase(email: string, password: string): Promise<boolean> {
    const user = fakeGetUser(email);
    if (!user)
        return false;

    if (!await Bun.password.verify(password, user.password))
        return false;
    return true;
}

describe('Auth Plugin', () => {
    describe('POST /login', () => {
        const sendToken = mock(() => Promise.resolve());
        const app = new Elysia()
            .use(errorPlugin)
            .use(authPlugin({
                accessTokenExpiration: '15m',
                refreshTokenExpiration: '7d',
                cookieSecret: 'cookieSecret',
                jwtSecret: 'jwtSecret',
                loginUseCase,
                redis,
                mfa: {
                    sendToken,
                    isEnable: (email: string) => fakeGetUser(email)?.mfa ?? false
                }
            }));

        afterEach(async () => {
            const redisClient = new Redis(redis);
            await Promise.all([
                redisClient.client.del('refresh:test1@example.com'),
                redisClient.client.del('mfa:test1@example.com'),
                redisClient.client.del('refresh:test2@example.com'),
                redisClient.client.del('mfa:test2@example.com')
            ]);
            await redisClient.client.quit();
        });

        test('should login without MFA and return Login success with cookie', async () => {
            const res = await app
                .handle(new Request('http://localhost/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: 'test1@example.com',
                        password: 'T€st1!@#0'
                    })
                }));
            const data = await res.json();
            expect(data).toEqual({
                message: 'Login success'
            });
            expect(res.status).toBe(200);
            expect(res.headers.get('Set-Cookie')).toBeDefined();
            expect(res.headers.get('Set-Cookie')).toContain('accessToken=');
            expect(res.headers.get('Set-Cookie')).toContain('refreshToken=');
        });

        test('should login with MFA and return MFA required', async () => {
            const res = await app
                .handle(new Request('http://localhost/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: 'test2@example.com',
                        password: 'T€st2!@#0'
                    })
                }));
            const data = await res.json();
            expect(data).toEqual({
                message: 'MFA required, a code is sent'
            });
            expect(res.status).toBe(200);
            expect(res.headers.get('Set-Cookie')).toBeNull();
            expect(sendToken).toHaveBeenCalled();
        });

        test('should return 400 when email is missing', async () => {
            const res = await app
                .handle(new Request('http://localhost/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        password: 'T€st1!@#0'
                    })
                }));
            const data = await res.json();
            expect(data).toEqual({
                cause: {
                    errors: [
                        {
                            errors: [],
                            message: 'Expected required property',
                            path: '/email',
                            schema: {
                                description: 'The email of the user',
                                error: 'Invalid email :c',
                                example: 'example@eg.com',
                                format: 'email',
                                type: 'string'
                            },
                            summary: 'Property \'email\' is missing',
                            type: 45
                        },
                        {
                            errors: [],
                            message: 'Expected string',
                            path: '/email',
                            schema: {
                                description: 'The email of the user',
                                error: 'Invalid email :c',
                                example: 'example@eg.com',
                                format: 'email',
                                type: 'string'
                            },
                            summary: 'Expected  property \'email\' to be  string but found: undefined',
                            type: 54
                        }
                    ],
                    found: {
                        password: 'T€st1!@#0'
                    },
                    on: 'body'
                },
                key: 'core.error.validation',
                message: 'Validation error'
            });
            expect(res.status).toBe(400);
        });

        test('should return 400 when password is missing', async () => {
            const res = await app
                .handle(new Request('http://localhost/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: 'test2@example.com'
                    })
                }));
            const data = await res.json();
            expect(data).toEqual({
                cause: {
                    errors: [
                        {
                            errors: [],
                            message: 'Expected required property',
                            path: '/password',
                            schema: {
                                error: 'The password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be between 8 and 32 characters long',
                                maxLength: 32,
                                minLength: 8,
                                pattern: '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,32}$',
                                type: 'string'
                            },
                            summary: 'Property \'password\' is missing',
                            type: 45
                        },
                        {
                            errors: [],
                            message: 'Expected string',
                            path: '/password',
                            schema: {
                                error: 'The password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be between 8 and 32 characters long',
                                maxLength: 32,
                                minLength: 8,
                                pattern: '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,32}$',
                                type: 'string'
                            },
                            summary: 'Expected  property \'password\' to be  string but found: undefined',
                            type: 54
                        }
                    ],
                    found: {
                        email: 'test2@example.com'
                    },
                    on: 'body'
                },
                key: 'core.error.validation',
                message: 'Validation error'
            });
            expect(res.status).toBe(400);
        });

        test('should return 400 when email is invalid validation', async () => {
            const res = await app
                .handle(new Request('http://localhost/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: 'test2',
                        password: 'T€st2!@#0'
                    })
                }));
            const data = await res.json();
            expect(data).toEqual({
                cause: {
                    errors: [
                        {
                            errors: [],
                            message: 'Expected string to match \'email\' format',
                            path: '/email',
                            schema: {
                                description: 'The email of the user',
                                error: 'Invalid email :c',
                                example: 'example@eg.com',
                                format: 'email',
                                type: 'string'
                            },
                            summary: 'Property \'email\' should be email',
                            type: 50,
                            value: 'test2'
                        }
                    ],
                    found: {
                        email: 'test2',
                        password: 'T€st2!@#0'
                    },
                    on: 'body'
                },
                key: 'core.error.validation',
                message: 'Validation error'
            });
            expect(res.status).toBe(400);
        });

        test('should return 400 when password is invalid validation', async () => {
            const res = await app
                .handle(new Request('http://localhost/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: 'test1@example.com',
                        password: 'test'
                    })
                }));
            const data = await res.json();
            expect(data).toEqual({
                cause: {
                    errors: [
                        {
                            errors: [],
                            message: 'Expected string length greater or equal to 8',
                            path: '/password',
                            schema: {
                                error: 'The password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be between 8 and 32 characters long',
                                maxLength: 32,
                                minLength: 8,
                                pattern: '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,32}$',
                                type: 'string'
                            },
                            summary: 'Expected string length greater or equal to 8',
                            type: 52,
                            value: 'test'
                        },
                        {
                            errors: [],
                            message: 'Expected string to match \'^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,32}$\'',
                            path: '/password',
                            schema: {
                                error: 'The password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be between 8 and 32 characters long',
                                maxLength: 32,
                                minLength: 8,
                                pattern: '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,32}$',
                                type: 'string'
                            },
                            summary: 'Expected string to match \'^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,32}$\'',
                            type: 53,
                            value: 'test'
                        }
                    ],
                    found: {
                        email: 'test1@example.com',
                        password: 'test'
                    },
                    on: 'body'
                },
                key: 'core.error.validation',
                message: 'Validation error'
            });
            expect(res.status).toBe(400);
        });

        test('should return 400 when email or password is invalid', async () => {
            const res = await app
                .handle(new Request('http://localhost/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: 'test3@example.com',
                        password: 'T€st3!@#0Asd'
                    })
                }));
            const data = await res.json();
            expect(data).toEqual({
                key: 'core.error.elysia.wrong_email_or_password',
                message: 'Invalid email or password'
            });
            expect(res.status).toBe(400);
        });
    });

    describe('POST /login/mfa', () => {
        const sendToken = mock(() => Promise.resolve());
        const app = new Elysia()
            .use(errorPlugin)
            .use(authPlugin({
                accessTokenExpiration: '15m',
                refreshTokenExpiration: '7d',
                cookieSecret: 'cookieSecret',
                jwtSecret: 'jwtSecret',
                loginUseCase,
                redis,
                mfa: {
                    sendToken,
                    isEnable: (email: string) => fakeGetUser(email)?.mfa ?? false
                }
            }));

        afterEach(async () => {
            const redisClient = new Redis(redis);
            await Promise.all([
                redisClient.client.del('refresh:test1@example.com'),
                redisClient.client.del('mfa:test1@example.com'),
                redisClient.client.del('refresh:test2@example.com'),
                redisClient.client.del('mfa:test2@example.com')
            ]);
            await redisClient.client.quit();
        });

        test('should login with MFA and return MFA success and login success', async () => {
            const redisClient = new Redis(redis);
            const token = '617af89d19fc3445';
            const hasher = new Bun.CryptoHasher('blake2b256');
            hasher.update(token);
            const tokenHash = hasher.digest('hex');
            await redisClient.client.set('mfa:test1@example.com', tokenHash);
            await redisClient.client.quit();
            const res = await app
                .handle(new Request('http://localhost/auth/login/mfa', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: 'test1@example.com',
                        token: '617af89d19fc3445'
                    })
                }));
            const data = await res.json();
            expect(data).toEqual({
                message: 'MFA success and login success'
            });
            expect(res.status).toBe(200);
            expect(res.headers.get('Set-Cookie')).toBeDefined();
            expect(res.headers.get('Set-Cookie')).toContain('accessToken=');
            expect(res.headers.get('Set-Cookie')).toContain('refreshToken=');
        });

        test('should return 400 when email is missing', async () => {
            const res = await app
                .handle(new Request('http://localhost/auth/login/mfa', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        token: '617af89d19fc3445'
                    })
                }));
            const data = await res.json();
            expect(data).toEqual({
                cause: {
                    errors: [
                        {
                            errors: [],
                            message: 'Expected required property',
                            path: '/email',
                            schema: {
                                description: 'The email of the user',
                                error: 'Invalid email :c',
                                example: 'example@eg.com',
                                format: 'email',
                                type: 'string'
                            },
                            summary: 'Property \'email\' is missing',
                            type: 45
                        },
                        {
                            errors: [],
                            message: 'Expected string',
                            path: '/email',
                            schema: {
                                description: 'The email of the user',
                                error: 'Invalid email :c',
                                example: 'example@eg.com',
                                format: 'email',
                                type: 'string'
                            },
                            summary: 'Expected  property \'email\' to be  string but found: undefined',
                            type: 54
                        }
                    ],
                    found: {
                        token: '617af89d19fc3445'
                    },
                    on: 'body'
                },
                key: 'core.error.validation',
                message: 'Validation error'
            });
            expect(res.status).toBe(400);
        });

        test('should return 400 when token is missing', async () => {
            const res = await app
                .handle(new Request('http://localhost/auth/login/mfa', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: 'test1@example.com'
                    })
                }));
            const data = await res.json();
            expect(data).toEqual({
                cause: {
                    errors: [
                        {
                            errors: [],
                            message: 'Expected required property',
                            path: '/token',
                            schema: {
                                description: 'The MFA token',
                                example: '617af89d19fc3445',
                                type: 'string'
                            },
                            summary: 'Property \'token\' is missing',
                            type: 45
                        },
                        {
                            errors: [],
                            message: 'Expected string',
                            path: '/token',
                            schema: {
                                description: 'The MFA token',
                                example: '617af89d19fc3445',
                                type: 'string'
                            },
                            summary: 'Expected  property \'token\' to be  string but found: undefined',
                            type: 54
                        }
                    ],
                    found: {
                        email: 'test1@example.com'
                    },
                    on: 'body'
                },
                key: 'core.error.validation',
                message: 'Validation error'
            });
            expect(res.status).toBe(400);
        });

        test('should return 400 when email or token is invalid', async () => {
            const res = await app
                .handle(new Request('http://localhost/auth/login/mfa', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: 'test1@example.com',
                        token: '617af89d19fc344'
                    })
                }));
            const data = await res.json();
            expect(data).toEqual({
                key: 'core.error.elysia.wrong_mfa_token',
                message: 'Invalid MFA token'
            });
            expect(res.status).toBe(400);
        });
    });

    describe('Macro isAuth (middleware)', () => {
        test('should return 401 when no access token or refresh token is provided', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .use(authPlugin({
                    accessTokenExpiration: '15m',
                    refreshTokenExpiration: '7d',
                    cookieSecret: 'cookieSecret',
                    jwtSecret: 'jwtSecret',
                    loginUseCase,
                    redis,
                    mfa: {
                        sendToken: () => Promise.resolve(),
                        isEnable: (email: string) => fakeGetUser(email)?.mfa ?? false
                    }
                }))
                .get('/example', () => 'example', { isAuth: true });
            const res = await app.handle(new Request('http://localhost/example'));
            const data = await res.json();
            expect(data).toEqual({
                key: 'core.error.elysia.unauthorized',
                message: 'Unauthorized'
            });
            expect(res.status).toBe(401);
        });

        test('should return 200 when the access token is correct', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .use(authPlugin({
                    accessTokenExpiration: '15m',
                    refreshTokenExpiration: '7d',
                    cookieSecret: 'cookieSecret',
                    jwtSecret: 'jwtSecret',
                    loginUseCase,
                    redis,
                    mfa: {
                        sendToken: () => Promise.resolve(),
                        isEnable: false
                    }
                }))
                .get('/example', () => 'example', { isAuth: true });
            const login = await app.handle(new Request('http://localhost/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: 'test1@example.com',
                    password: 'T€st1!@#0'
                })
            }));
            const cookie = login.headers.getSetCookie().join('; ');
            const res = await app.handle(new Request('http://localhost/example', {
                headers: {
                    Cookie: cookie
                }
            }));
            const data = await res.text();
            expect(data).toEqual('example');
            expect(res.status).toBe(200);
        });

        test('should return 401 when the access token and refresh token is invalid', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .use(authPlugin({
                    accessTokenExpiration: '15m',
                    refreshTokenExpiration: '7d',
                    cookieSecret: 'cookieSecret',
                    jwtSecret: 'jwtSecret',
                    loginUseCase,
                    redis,
                    mfa: {
                        sendToken: () => Promise.resolve(),
                        isEnable: false
                    }
                }))
                .get('/example', () => 'example', { isAuth: true });
            const res = await app.handle(new Request('http://localhost/example', {
                headers: {
                    Cookie: 'accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJleGFtcGxlQGVnLmNvbSIsImlhdCI6MTUxNjIzOTAyMn0.D6lOmpoQYTlcTK05tsnP0YhyUWEk37G7qJGdICt75eA;refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJleGFtcGxlQGVnLmNvbSIsImlhdCI6MTUxNjIzOTAyMn0.D6lOmpoQYTlcTK05tsnP0YhyUWEk37G7qJGdICt75eA'
                }
            }));
            const data = await res.json();
            expect(data).toEqual({
                key: 'core.error.elysia.unauthorized',
                message: 'Unauthorized'
            });
            expect(res.status).toBe(401);
        });

        test('should return 401 when the access token is expired and the refresh token too', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .use(authPlugin({
                    accessTokenExpiration: '1s',
                    refreshTokenExpiration: '1s',
                    cookieSecret: 'cookieSecret',
                    jwtSecret: 'jwtSecret',
                    loginUseCase,
                    redis,
                    mfa: {
                        sendToken: () => Promise.resolve(),
                        isEnable: false
                    }
                }))
                .get('/example', () => 'example', { isAuth: true });
            const login = await app.handle(new Request('http://localhost/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: 'test1@example.com',
                    password: 'T€st1!@#0'
                })
            }));
            const cookie = login.headers.getSetCookie().join('; ');
            await Bun.sleep(1100);
            const res = await app.handle(new Request('http://localhost/example', {
                headers: {
                    Cookie: cookie
                }
            }));
            const data = await res.json();
            expect(data).toEqual({
                key: 'core.error.elysia.unauthorized',
                message: 'Unauthorized'
            });
            expect(res.status).toBe(401);
        });

        test('should return 401 when the refresh token is not find in the store', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .use(authPlugin({
                    accessTokenExpiration: '1s',
                    refreshTokenExpiration: '2m',
                    cookieSecret: 'cookieSecret',
                    jwtSecret: 'jwtSecret',
                    loginUseCase,
                    redis,
                    mfa: {
                        sendToken: () => Promise.resolve(),
                        isEnable: false
                    }
                }))
                .get('/example', () => 'example', { isAuth: true });
            const login = await app.handle(new Request('http://localhost/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: 'test1@example.com',
                    password: 'T€st1!@#0'
                })
            }));
            const refreshToken = login.headers.getSetCookie()?.find((cookie) => cookie.includes('refreshToken='))?.split('=')[1] ?? '';
            const { jti } = JSON.parse(atob(refreshToken.split('.')[1])) as { jti: string };
            const redisClient = new Redis(redis);
            await redisClient.client.hdel('refresh:test1@example.com', jti);
            await redisClient.client.quit();
            await Bun.sleep(1100);
            const res = await app.handle(new Request('http://localhost/example', {
                headers: {
                    Cookie: login.headers.getSetCookie().join('; ')
                }
            }));
            const data = await res.json();
            expect(data).toEqual({
                key: 'core.error.elysia.unauthorized',
                message: 'Unauthorized'
            });
            expect(res.status).toBe(401);
        });

        test('should remove the stored refresh token before re generate a new one', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .use(authPlugin({
                    accessTokenExpiration: '1s',
                    refreshTokenExpiration: '2m',
                    cookieSecret: 'cookieSecret',
                    jwtSecret: 'jwtSecret',
                    loginUseCase,
                    redis,
                    mfa: {
                        sendToken: () => Promise.resolve(),
                        isEnable: false
                    }
                }))
                .get('/example', () => 'example', { isAuth: true });
            const login = await app.handle(new Request('http://localhost/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: 'test1@example.com',
                    password: 'T€st1!@#0'
                })
            }));
            await Bun.sleep(1100);
            await app.handle(new Request('http://localhost/example', {
                headers: {
                    Cookie: login.headers.getSetCookie().join('; ')
                }
            }));
            const refreshToken = login.headers.getSetCookie()?.find((cookie) => cookie.includes('refreshToken='))?.split('=')[1] ?? '';
            const { jti } = JSON.parse(atob(refreshToken.split('.')[1])) as { jti: string };
            const redisClient = new Redis(redis);
            const res = await redisClient.client.hexists('refresh:test1@example.com', jti);
            await redisClient.client.quit();
            expect(res).toBe(0);
        });

        test('should return 200 and refresh the access and refresh token when the access token is expired and the refresh token is valid', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .use(authPlugin({
                    accessTokenExpiration: '1s',
                    refreshTokenExpiration: '2m',
                    cookieSecret: 'cookieSecret',
                    jwtSecret: 'jwtSecret',
                    loginUseCase,
                    redis,
                    mfa: {
                        sendToken: () => Promise.resolve(),
                        isEnable: false
                    }
                }))
                .get('/example', () => 'example', { isAuth: true });
            const login = await app.handle(new Request('http://localhost/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: 'test1@example.com',
                    password: 'T€st1!@#0'
                })
            }));
            await Bun.sleep(1100);
            const oldCookie = login.headers.getSetCookie().join('; ');
            const res = await app.handle(new Request('http://localhost/example', {
                headers: {
                    Cookie: oldCookie
                }
            }));
            const data = await res.text();
            expect(data).toEqual('example');
            expect(res.status).toBe(200);
            const newCookie = res.headers.getSetCookie().join('; ');
            expect(newCookie).not.toEqual(oldCookie);
        });
    });

    describe('GET /logout', () => {
        test('should return 200 Logout success', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .use(authPlugin({
                    accessTokenExpiration: '15m',
                    refreshTokenExpiration: '7d',
                    cookieSecret: 'cookieSecret',
                    jwtSecret: 'jwtSecret',
                    loginUseCase,
                    redis,
                    mfa: {
                        sendToken: () => Promise.resolve(),
                        isEnable: (email: string) => fakeGetUser(email)?.mfa ?? false
                    }
                }))
                .get('/example', () => 'example', { isAuth: true });
            const login = await app.handle(new Request('http://localhost/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: 'test1@example.com',
                    password: 'T€st1!@#0'
                })
            }));

            const logout = await app.handle(new Request('http://localhost/auth/logout', {
                headers: {
                    Cookie: login.headers.getSetCookie().join('; ')
                }
            }));
            const refreshToken = login.headers.getSetCookie()?.find((cookie) => cookie.includes('refreshToken='))?.split('=')[1] ?? '';
            const { jti } = JSON.parse(atob(refreshToken.split('.')[1])) as { jti: string };
            const redisClient = new Redis(redis);
            const res = await redisClient.client.hexists('refresh:test1@example.com', jti);
            await redisClient.client.quit();
            expect(res).toBe(0);
            expect(logout.status).toBe(200);
            expect(logout.headers.getSetCookie()).toEqual([
                'accessToken=; Max-Age=0; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
                'refreshToken=; Max-Age=0; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
            ]);
            expect(await logout.json()).toEqual({
                message: 'Logout success'
            });
        });
    });
});
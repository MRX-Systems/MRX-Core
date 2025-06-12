import { describe, expect, mock, spyOn, test } from 'bun:test';
import { Elysia } from 'elysia';
import { SignJWT, type JWTPayload } from 'jose';

import { errorPlugin } from '#/modules/elysia/errorPlugin/error';
import { jwtPlugin } from '#/modules/elysia/jwtPlugin/jwt';
import { CoreError } from '#/error/coreError';

describe('JWT Plugin', () => {
    describe('Decorate', () => {
        test('should add jwt to context when jwtPlugin is used', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .use(jwtPlugin({
                    secret: 'secret'
                }))
                .get('/', ({ jwt }) => ({ jwt }));
            const res = await app.handle(new Request('http://localhost:3000/'));
            const data = await res.json();
            expect(data).toEqual({
                jwt: expect.any(Object)
            });
        });
        test('should add jwt to context when jwtPlugin is used with custom key', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .use(jwtPlugin({
                    secret: 'secret',
                    name: 'customKey'
                }))
                .get('/', ({ customKey }) => ({ customKey }));
            const res = await app.handle(new Request('http://localhost:3000/'));
            const data = await res.json();
            expect(data).toEqual({
                customKey: expect.any(Object)
            });
        });
        test('should throw error when secret is not provided', () => {
            const elysia = new Elysia();
            expect(() => {
                elysia
                    .use(jwtPlugin({
                        secret: ''
                    }));
            }).toThrow(CoreError);
            expect(() => {
                elysia
                    .use(jwtPlugin({
                        secret: ''
                    }));
            }).toThrow('Secret key is required for JWT signing and verification.');
        });
        test('should sign', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .use(jwtPlugin({
                    secret: 'secret'
                }))
                .get('/sign', async ({ jwt }) => {
                    const token = await jwt.sign();
                    return { token };
                });

            const signRes = await app.handle(new Request('http://localhost:3000/sign'));
            const signData = await signRes.json();
            expect(signData).toEqual({
                token: expect.any(String)
            });
        });
        test('should sign with global payload', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .use(jwtPlugin({
                    secret: 'secret',
                    payload: {
                        sub: 'userId'
                    }
                }))
                .get('/sign', async ({ jwt }) => {
                    const token = await jwt.sign();
                    return { token };
                });

            const signRes = await app.handle(new Request('http://localhost:3000/sign'));
            const signData = await signRes.json();
            expect(signData).toEqual({
                token: expect.any(String)
            });
            const { token } = signData as { token: string };
            const payload = atob(token.split('.')[1]);
            const parsedPayload: { sub: string } = JSON.parse(payload);
            expect(parsedPayload.sub).toEqual('userId');
        });
        test('should sign with additionnal payload', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .use(jwtPlugin({
                    secret: 'secret'
                }))
                .get('/sign', async ({ jwt }) => {
                    const token = await jwt.sign({ sub: 'userId' });
                    return { token };
                });

            const signRes = await app.handle(new Request('http://localhost:3000/sign'));
            const signData = await signRes.json();
            expect(signData).toEqual({
                token: expect.any(String)
            });
            const { token } = signData as { token: string };
            const payload = atob(token.split('.')[1]);
            const parsedPayload: { sub: string } = JSON.parse(payload);
            expect(parsedPayload.sub).toEqual('userId');
        });
        test('should sign with additionnal payload and global payload', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .use(jwtPlugin({
                    secret: 'secret',
                    payload: {
                        sub: 'userId'
                    }
                }))
                .get('/sign', async ({ jwt }) => {
                    const token = await jwt.sign({ sub: 'otherUserId' });
                    return { token };
                });

            const signRes = await app.handle(new Request('http://localhost:3000/sign'));
            const signData = await signRes.json();
            expect(signData).toEqual({
                token: expect.any(String)
            });
            const { token } = signData as { token: string };
            const payload = atob(token.split('.')[1]);
            const parsedPayload: { sub: string } = JSON.parse(payload);
            expect(parsedPayload.sub).toEqual('otherUserId');
        });
        test('should sign with issuer and audience', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .use(jwtPlugin({
                    secret: 'secret',
                    payload: {
                        iss: 'issuer',
                        aud: 'audience'
                    }
                }))
                .get('/sign', async ({ jwt }) => {
                    const token = await jwt.sign();
                    return { token };
                });

            const signRes = await app.handle(new Request('http://localhost:3000/sign'));
            const signData = await signRes.json();
            expect(signData).toEqual({
                token: expect.any(String)
            });
            const { token } = signData as { token: string };
            const payload = atob(token.split('.')[1]);
            const parsedPayload: { iss: string, aud: string } = JSON.parse(payload);
            expect(parsedPayload.iss).toEqual('issuer');
            expect(parsedPayload.aud).toEqual('audience');
        });
        test('should throw error when sign fails', async () => {
            const spySignJose = spyOn(SignJWT.prototype, 'sign');
            spySignJose.mockImplementation(() => {
                throw new Error('Sign error');
            });
            const app = new Elysia()
                .use(errorPlugin)
                .use(jwtPlugin({
                    secret: 'secret'
                }))
                .get('/sign', async ({ jwt }) => {
                    await jwt.sign();
                    return {};
                });
            const signRes = await app.handle(new Request('http://localhost:3000/sign'));
            const signData = await signRes.json();
            expect(signRes.status).toEqual(500);
            expect(signData).toEqual({
                key: 'core.error.elysia.jwt_sign_error',
                message: 'Error signing JWT.'
            });
            mock.restore();
        });

        test('should verify and get payload', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .use(jwtPlugin({
                    secret: 'secret'
                }))
                .get('/verify', async ({ jwt }) => {
                    const token = await jwt.sign({ sub: 'userId' });
                    const payload = await jwt.verify(token);
                    return { payload };
                });

            const verifyRes = await app.handle(new Request('http://localhost:3000/verify'));
            const verifyData = await verifyRes.json();
            expect(verifyData).toEqual({
                payload: expect.any(Object)
            });
            const { payload: { sub } } = verifyData as { payload: { sub: string } };
            expect(sub).toEqual('userId');
        });
        test('should verify with bad token', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .use(jwtPlugin({
                    secret: 'secret'
                }))
                .get('/verify', async ({ jwt }) => {
                    const payload = await jwt.verify('bad-token');
                    return { payload };
                });

            const verifyRes = await app.handle(new Request('http://localhost:3000/verify'));
            const verifyData = await verifyRes.json();
            expect(verifyData).toEqual({
                payload: false
            });
        });
        test('should verify with expired token', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .use(jwtPlugin({
                    secret: 'secret',
                    exp: 1
                }))
                .get('/verify', async ({ jwt }) => {
                    const token = await jwt.sign();
                    await Bun.sleep(2);
                    const payload = await jwt.verify(token);
                    return { payload };
                });

            const verifyRes = await app.handle(new Request('http://localhost:3000/verify'));
            const verifyData = await verifyRes.json();
            expect(verifyData).toEqual({
                payload: false
            });
        });
    });

    describe('Edge Cases and Security', () => {
        test('should handle empty/null token verification', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .use(jwtPlugin({
                    secret: 'secret'
                }))
                .get('/verify-empty', async ({ jwt }) => {
                    const emptyResult = await jwt.verify('');
                    const nullResult = await jwt.verify(undefined);
                    return { emptyResult, nullResult };
                });

            const response = await app.handle(new Request('http://localhost:3000/verify-empty'));
            const data = await response.json();
            expect(data).toEqual({
                emptyResult: false,
                nullResult: false
            });
        });

        test('should handle malformed tokens', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .use(jwtPlugin({
                    secret: 'secret'
                }))
                .get('/verify-malformed', async ({ jwt }) => {
                    const results = await Promise.all([
                        jwt.verify('not.a.jwt'),
                        jwt.verify('only.two.parts'),
                        jwt.verify('one'),
                        jwt.verify('....'),
                        jwt.verify('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9') // Only header
                    ]);
                    return { results };
                });

            const response = await app.handle(new Request('http://localhost:3000/verify-malformed'));
            const data = await response.json() as { results: boolean[] };
            expect(data.results).toEqual([false, false, false, false, false]);
        });

        test('should handle token with wrong secret', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .use(jwtPlugin({
                    secret: 'secret2'
                }))
                .get('/verify', async ({ jwt }) => {
                    // Token signed with different secret
                    const wrongSecretToken = 'eyJhbGciOiJIUzI1NiIsImI2NCI6dHJ1ZSwidHlwIjoiSldUIn0.eyJpc3MiOiJjb3JlIiwiYXVkIjoiY29yZSBjbGllbnQiLCJqdGkiOiIwMTkyYjMxZi1lMjIyLTczYWMtOGQyZC1lODM1NzJkMDBjNDQiLCJleHAiOjE3NjcxMDkzMjZ9.wrong_signature';
                    const payload = await jwt.verify(wrongSecretToken);
                    return { payload };
                });

            const response = await app.handle(new Request('http://localhost:3000/verify'));
            const data = await response.json();
            expect(data).toEqual({
                payload: false
            });
        });

        test('should handle special characters in payload', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .use(jwtPlugin({
                    secret: 'secret'
                }))
                .get('/special-chars', async ({ jwt }) => {
                    const specialPayload = {
                        user: 'Test User 🚀',
                        description: 'Special chars: éàç ñ 中文 🎉',
                        emoji: '👍💯🔥',
                        quotes: '"quoted" and \'single quotes\'',
                        json: JSON.stringify({ nested: 'value' })
                    };

                    const token = await jwt.sign(specialPayload);
                    const verified = await jwt.verify(token);
                    return { originalPayload: specialPayload, verifiedPayload: verified };
                });

            const response = await app.handle(new Request('http://localhost:3000/special-chars'));
            const data = await response.json() as {
                originalPayload: Record<string, unknown>;
                verifiedPayload: Record<string, unknown>;
            };

            expect(data.verifiedPayload).toMatchObject(data.originalPayload);
        });

        test('should handle large payloads', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .use(jwtPlugin({
                    secret: 'secret'
                }))
                .get('/large-payload', async ({ jwt }) => {
                    const largePayload = {
                        data: Array.from({ length: 1000 }, (_, i) => `item${i}`),
                        metadata: {
                            description: 'A'.repeat(1000),
                            tags: Array.from({ length: 100 }, (_, i) => `tag${i}`)
                        }
                    };

                    const token = await jwt.sign(largePayload);
                    const verified = await jwt.verify(token);
                    return {
                        success: true,
                        dataLength: verified !== false ? (verified.data as unknown[])?.length : 0
                    };
                });

            const response = await app.handle(new Request('http://localhost:3000/large-payload'));
            const data = await response.json() as {
                success: boolean;
                dataLength: number;
            };

            expect(data.success).toBe(true);
            expect(data.dataLength).toBe(1000);
        });
    });

    describe('Different Configurations', () => {
        test('should work with different secret formats', async () => {
            const configs = [
                { secret: 'simple-secret', name: 'Simple string' },
                { secret: 'a'.repeat(256), name: 'Very long secret' },
                { secret: '!@#$%^&*()_+-=[]{}|;:,.<>?', name: 'Special characters' },
                { secret: '123456789', name: 'Numeric string' }
            ];

            for (const config of configs) {
                const app = new Elysia()
                    .use(errorPlugin)
                    .use(jwtPlugin({
                        secret: config.secret
                    }))
                    .get('/test', async ({ jwt }) => {
                        const token = await jwt.sign({ test: config.name });
                        const verified = await jwt.verify(token);
                        return { verified };
                    });

                const response = await app.handle(new Request('http://localhost:3000/test'));
                const data = await response.json() as { verified: JWTPayload | false };

                expect(data.verified).toMatchObject({ test: config.name });
            }
        });

        test('should handle different expiration formats', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .use(jwtPlugin({
                    secret: 'secret'
                }))
                .get('/exp-test', async ({ jwt }) => {
                    // Test string format (most common and reliable)
                    const token1 = await jwt.sign({ type: 'string' }, '1h');
                    const result1 = await jwt.verify(token1);

                    // Test default expiration (should work)
                    const token2 = await jwt.sign({ type: 'default' });
                    const result2 = await jwt.verify(token2);

                    return {
                        stringFormat: result1,
                        defaultFormat: result2
                    };
                });

            const response = await app.handle(new Request('http://localhost:3000/exp-test'));
            const data = await response.json() as {
                stringFormat: JWTPayload | false;
                defaultFormat: JWTPayload | false;
            };

            // String format should work
            expect(data.stringFormat).not.toBe(false);
            if (data.stringFormat !== false)
                expect(data.stringFormat).toMatchObject({ type: 'string' });

            // Default format should work
            expect(data.defaultFormat).not.toBe(false);
            if (data.defaultFormat !== false)
                expect(data.defaultFormat).toMatchObject({ type: 'default' });
        });
    });

    describe('Integration and Workflow Tests', () => {
        test('should work in authentication workflow', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .use(jwtPlugin({
                    secret: 'auth-secret',
                    payload: {
                        iss: 'auth-service',
                        aud: 'api-clients'
                    }
                }))
                .post('/login', async ({ jwt }) => {
                    // Simulate login
                    const token = await jwt.sign({
                        sub: 'user123',
                        role: 'admin',
                        permissions: ['read', 'write', 'delete']
                    });
                    return { token, message: 'Login successful' };
                })
                .get('/protected', async ({ jwt, headers }) => {
                    const authHeader = headers.authorization;
                    if (!authHeader?.startsWith('Bearer '))
                        return { error: 'Missing or invalid authorization header' };


                    const token = authHeader.slice(7);
                    const payload = await jwt.verify(token);

                    if (!payload)
                        return { error: 'Invalid token' };


                    return {
                        message: 'Access granted',
                        user: payload.sub,
                        permissions: payload.permissions
                    };
                });

            // Login to get token
            const loginResponse = await app.handle(new Request('http://localhost:3000/login', {
                method: 'POST'
            }));
            const loginData = await loginResponse.json() as {
                token: string;
                message: string;
            };
            expect(loginData.message).toBe('Login successful');
            expect(loginData.token).toBeDefined();

            // Use token to access protected resource
            const protectedResponse = await app.handle(new Request('http://localhost:3000/protected', {
                headers: {
                    authorization: `Bearer ${loginData.token}`
                }
            }));
            const protectedData = await protectedResponse.json() as {
                message: string;
                user: string;
                permissions: string[];
            };

            expect(protectedData.message).toBe('Access granted');
            expect(protectedData.user).toBe('user123');
            expect(protectedData.permissions).toEqual(['read', 'write', 'delete']);
        });

        test('should handle concurrent sign/verify operations', async () => {
            const app = new Elysia()
                .use(errorPlugin)
                .use(jwtPlugin({
                    secret: 'concurrent-secret'
                }));

            // Create multiple concurrent operations
            const operations = Array.from({ length: 50 }, async (_, i) => {
                const tempApp = new Elysia()
                    .use(app)
                    .get('/concurrent', async ({ jwt }) => {
                        const token = await jwt.sign({ userId: `user${i}`, timestamp: Date.now() });
                        const verified = await jwt.verify(token);
                        return {
                            userId: verified !== false ? verified.userId as string : undefined,
                            success: !!verified
                        };
                    });

                const response = await tempApp.handle(new Request('http://localhost:3000/concurrent'));
                return response.json();
            });

            const results = await Promise.all(operations);

            // All operations should succeed
            results.forEach((result, i) => {
                const typedResult = result as { success: boolean; userId: string };
                expect(typedResult.success).toBe(true);
                expect(typedResult.userId).toBe(`user${i}`);
            });
        });
    });
});

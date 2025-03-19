import { describe, expect, test, spyOn, mock } from 'bun:test';
import { Elysia } from 'elysia';
import { SignJWT } from 'jose';

import { errorPlugin } from '#/root/source/core/elysia/plugin/error';
import { jwtPlugin } from '#/root/source/core/elysia/plugin/jwt';
import { CoreError } from '#/root/source/error/coreError';

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
            console.log(signData);
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
            const { token }: { token: string } = signData;
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
            const { token }: { token: string } = signData;
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
            const { token }: { token: string } = signData;
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
            const { token }: { token: string } = signData;
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
                key: 'core.error.util.jwt_sign_error',
                message: 'Error signing JWT.'
            });
            mock.restore();
        });

        test('sould verify and get payload', async () => {
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
            const { payload: { sub } }: { payload: { sub: string } } = verifyData;
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
});

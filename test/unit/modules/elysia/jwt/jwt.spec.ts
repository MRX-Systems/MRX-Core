import { describe, expect, test } from 'bun:test';
import { Elysia } from 'elysia';
import type { JWTVerifyResult } from 'jose';

import { HttpError } from '#/errors/httpError';
import { JWT_ERROR_KEYS } from '#/modules/elysia/jwt/enums/jwtErrorKeys';
import { jwt as jwtPlugin } from '#/modules/elysia/jwt/jwt';

describe('jwt', () => {
	describe('plugin initialization', () => {
		test('should throw HttpError when secret is not provided', () => {
			expect(() => {
				jwtPlugin({ secret: '' });
			}).toThrow(HttpError);
		});

		test('should throw with correct error key when secret is missing', () => {
			try {
				jwtPlugin({ secret: '' });
			} catch (error) {
				expect(error).toBeInstanceOf(HttpError);
				expect((error as HttpError).message).toBe(JWT_ERROR_KEYS.JWT_SECRET_NOT_FOUND);
				expect((error as HttpError).httpStatusCode).toBe(500);
			}
		});

		test('should create plugin successfully with valid configuration', () => {
			const plugin = jwtPlugin({
				secret: 'my-very-secure-secret-key-that-is-long-enough-for-hs256-algorithm',
				exp: '1h',
				payload: { iss: 'test-issuer' }
			});

			expect(plugin).toBeDefined();
			expect(plugin.config.name).toBe('jwt');
		});
	});

	describe('JWT operations', () => {
		const testSecret = 'my-very-secure-secret-key-that-is-long-enough-for-hs256-algorithm';

		test('should sign and verify JWT successfully', async () => {
			const app = new Elysia().use(
				jwtPlugin({
					secret: testSecret,
					exp: '1h'
				})
			);

			const { jwt } = app.decorator;

			// Sign a token
			const token: string = await jwt.sign({ userId: 123, role: 'admin' });
			expect(token).toBeTypeOf('string');
			expect(token.split('.')).toHaveLength(3); // JWT has 3 parts

			// Verify the token
			const { payload } = await jwt.verify(token) as JWTVerifyResult;
			expect(payload).toBeTruthy();
			expect(payload?.userId).toBe(123);
			expect(payload?.role).toBe('admin');
		});

		test('should include default payload in signed JWT', async () => {
			const app = new Elysia().use(
				jwtPlugin({
					secret: testSecret,
					payload: { iss: 'test-app', aud: 'test-client' }
				})
			);

			const { jwt } = app.decorator;
			const token: string = await jwt.sign({ userId: 456 });
			const { payload } = await jwt.verify(token) as JWTVerifyResult;

			expect(payload).toBeTruthy();
			expect(payload?.iss).toBe('test-app');
			expect(payload?.aud).toEqual(['test-client']); // Audience is always an array in JWT
			expect(payload?.userId).toBe(456);
		});

		test('should override default payload with additional payload', async () => {
			const app = new Elysia().use(
				jwtPlugin({
					secret: testSecret,
					payload: { iss: 'default-issuer', aud: 'default-audience' }
				})
			);

			const { jwt } = app.decorator;
			const token: string = await jwt.sign({
				iss: 'custom-issuer',
				userId: 789
			});
			const { payload } = await jwt.verify(token) as JWTVerifyResult;

			expect(payload).toBeTruthy();
			expect(payload?.iss).toBe('custom-issuer'); // Overridden
			expect(payload?.aud).toEqual(['default-audience']); // From default, as array
			expect(payload?.userId).toBe(789); // Additional
		});

		test('should return false for invalid JWT', async () => {
			const app = new Elysia().use(
				jwtPlugin({ secret: testSecret })
			);

			const { jwt } = app.decorator;

			const invalidTokenResult = await jwt.verify('invalid.jwt.token');
			expect(invalidTokenResult).toBe(false);

			const emptyTokenResult = await jwt.verify('');
			expect(emptyTokenResult).toBe(false);

			const undefinedTokenResult = await jwt.verify(undefined);
			expect(undefinedTokenResult).toBe(false);
		});
		test('should include standard JWT claims', async () => {
			const app = new Elysia().use(
				jwtPlugin({ secret: testSecret })
			);

			const { jwt } = app.decorator;
			const token: string = await jwt.sign({ userId: 111 });
			const { payload } = await jwt.verify(token) as JWTVerifyResult;

			expect(payload).toBeTruthy();
			expect(payload?.jti).toBeTypeOf('string'); // JWT ID
			expect(payload?.iat).toBeTypeOf('number'); // Issued at
			expect(payload?.exp).toBeTypeOf('number'); // Expires at
		});

		test('should work with custom JWT key name', async () => {
			const app = new Elysia().use(
				jwtPlugin({
					jwtKeyName: 'auth',
					secret: testSecret
				})
			);
			const { auth } = app.decorator;
			expect(auth).toBeDefined();

			const token: string = await auth.sign({ userId: 999 });
			const { payload } = await auth.verify(token) as JWTVerifyResult;

			expect(payload).toBeTruthy();
			expect(payload?.userId).toBe(999);
		});
	});

	describe('security scenarios', () => {
		const testSecret = 'my-very-secure-secret-key-that-is-long-enough-for-hs256-algorithm';

		test('should reject JWT signed with different secret', async () => {
			const app1 = new Elysia().use(
				jwtPlugin({ secret: testSecret })
			);

			const app2 = new Elysia().use(
				jwtPlugin({ secret: 'different-secret-key-that-is-also-long-enough' })
			);

			const { jwt: jwt1 } = app1.decorator;
			const { jwt: jwt2 } = app2.decorator;

			const tokenFromApp1: string = await jwt1.sign({ userId: 123 });
			const verificationResult = await jwt2.verify(tokenFromApp1);

			expect(verificationResult).toBe(false);
		});

		test('should generate unique JWT IDs for different tokens', async () => {
			const app = new Elysia().use(
				jwtPlugin({ secret: testSecret })
			);

			const { jwt } = app.decorator;

			const token1: string = await jwt.sign({ userId: 1 });
			const token2: string = await jwt.sign({ userId: 2 });

			const { payload: payload1 } = await jwt.verify(token1) as JWTVerifyResult;
			const { payload: payload2 } = await jwt.verify(token2) as JWTVerifyResult;

			expect(payload1?.jti).not.toBe(payload2?.jti);
		});
	});

	describe('edge cases and error handling', () => {
		const testSecret = 'my-very-secure-secret-key-that-is-long-enough-for-hs256-algorithm';

		test('should handle custom headers correctly', async () => {
			const app = new Elysia().use(
				jwtPlugin({
					secret: testSecret,
					header: {
						kid: 'key-1',
						b64: false, // This should be filtered out
						customHeader: 'custom-value'
					}
				})
			);

			const { jwt } = app.decorator;
			const token: string = await jwt.sign({ userId: 123 });

			// Token should still be valid despite b64 being filtered
			const { payload } = await jwt.verify(token) as JWTVerifyResult;
			expect(payload).toBeTruthy();
			expect(payload?.userId).toBe(123);
		});

		test('should handle payload without issuer', async () => {
			const app = new Elysia().use(
				jwtPlugin({
					secret: testSecret,
					payload: { aud: 'test-client' } // No issuer
				})
			);

			const { jwt } = (app).decorator;
			// @ts-expect-error This should not throw, issuer is optional
			const token: string = await jwt.sign({
				userId: 456,
				iss: undefined // Explicitly undefined issuer
			});

			const { payload } = await jwt.verify(token) as JWTVerifyResult;
			expect(payload).toBeTruthy();
			expect(payload?.userId).toBe(456);
			expect(payload?.aud).toEqual(['test-client']);
		});

		test('should handle payload without audience', async () => {
			const app = new Elysia().use(
				jwtPlugin({
					secret: testSecret,
					payload: { iss: 'test-issuer' } // No audience
				})
			);

			const { jwt } = app.decorator;
			// @ts-expect-error This should not throw, audience is optional
			const token: string = await jwt.sign({
				userId: 789,
				aud: undefined // Explicitly undefined audience
			});

			const { payload } = await jwt.verify(token) as JWTVerifyResult;
			expect(payload).toBeTruthy();
			expect(payload?.userId).toBe(789);
			expect(payload?.iss).toBe('test-issuer');
		});

		test('should handle both undefined issuer and audience', async () => {
			const app = new Elysia().use(
				jwtPlugin({
					secret: testSecret
					// No default payload
				})
			);

			const { jwt } = app.decorator;
			const token: string = await jwt.sign({
				userId: 999
				// Don't set iss or aud at all, let defaults apply
			});

			const { payload } = await jwt.verify(token) as JWTVerifyResult;
			expect(payload).toBeTruthy();
			expect(payload?.userId).toBe(999);
			// Should have default values from plugin
			expect(payload?.iss).toBe('elysia-jwt-plugin');
			expect(payload?.aud).toEqual(['elysia-application']);
		});

		test('should throw HttpError when signing fails', async () => {
			const app = new Elysia().use(
				jwtPlugin({ secret: testSecret })
			);
			const { jwt } = app.decorator;

			try {
				await jwt.sign({ userId: 123 }, 'invalid-expiration-format');
			} catch (error) {
				expect(error).toBeInstanceOf(HttpError);
				expect((error as HttpError).httpStatusCode).toBe(500);
				expect((error as HttpError).message).toContain(JWT_ERROR_KEYS.JWT_SIGN_ERROR);
			}
		});

		test('should handle signing with circular reference payload', async () => {
			const app = new Elysia().use(
				jwtPlugin({ secret: testSecret })
			);

			const { jwt } = app.decorator;

			// Create circular reference
			const circularPayload: Record<string, unknown> = { userId: 123 };
			circularPayload.self = circularPayload;

			try {
				await jwt.sign(circularPayload);
				expect(true).toBe(false); // Should not reach here
			} catch (error) {
				expect(error).toBeInstanceOf(HttpError);
				expect((error as HttpError).message).toBe(JWT_ERROR_KEYS.JWT_SIGN_ERROR);
			}
		});
	});
});

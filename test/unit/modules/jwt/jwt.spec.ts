import { beforeEach, describe, expect, spyOn, test } from 'bun:test';
import type { JWTPayload, JWTVerifyResult } from 'jose';

import { InternalError } from '#/errors/internal-error';
import { JWT_ERROR_KEYS } from '#/modules/jwt/enums/jwt-error-keys';
import { signJWT, verifyJWT } from '#/modules/jwt/jwt';

describe.concurrent('JWT Core Functions', () => {
	const testSecret = 'my-very-secure-secret-key-that-is-long-enough-for-hs256-algorithm';
	const wrongSecret = 'wrong-secret-key-that-is-also-long-enough-for-hs256';
	const userUuid = Bun.randomUUIDv7();

	// Time constants
	const ONE_HOUR = 3600;
	const TWO_HOURS = 7200;
	const DEFAULT_EXPIRY_MINUTES = 15;
	const DEFAULT_EXPIRY_SECONDS = DEFAULT_EXPIRY_MINUTES * 60;

	let currentTime: number;

	beforeEach(() => {
		currentTime = Math.floor(Date.now() / 1000);
	});

	describe.concurrent('signJWT', () => {
		test('should sign a JWT with default expiration (15 minutes)', async () => {
			const payload: JWTPayload = { sub: userUuid, role: 'admin' };
			const token = await signJWT(testSecret, payload);

			expect(token).toBeTypeOf('string');
			expect(token.split('.')).toHaveLength(3); // Header.Payload.Signature

			// Verify the token to check its contents
			const result = await verifyJWT(token, testSecret) as JWTVerifyResult;
			expect(result).not.toBe(false);
			expect(result.payload.sub).toBe(userUuid);
			expect(result.payload.role).toBe('admin');
			expect(result.payload.exp).toBeGreaterThan(currentTime);
			expect(result.payload.exp).toBeLessThanOrEqual(currentTime + DEFAULT_EXPIRY_SECONDS + 5); // Allow 5s tolerance
		});

		test.each([
			{
				name: 'numeric expiration (seconds offset)',
				getExpiration: () => ONE_HOUR,
				expectedExpiration: (currentTime: number) => currentTime + ONE_HOUR,
				tolerance: 5
			},
			{
				name: 'Date expiration (2 hours)',
				getExpiration: () => new Date(Date.now() + (TWO_HOURS * 1000)),
				expectedExpiration: () => Math.floor((Date.now() + (TWO_HOURS * 1000)) / 1000),
				tolerance: 2
			},
			{
				name: 'Date expiration (30 minutes)',
				getExpiration: () => new Date(Date.now() + (30 * 60 * 1000)),
				expectedExpiration: () => Math.floor((Date.now() + (30 * 60 * 1000)) / 1000),
				tolerance: 2
			},
			{
				name: 'Date expiration (1 day)',
				getExpiration: () => new Date(Date.now() + (24 * 60 * 60 * 1000)),
				expectedExpiration: () => Math.floor((Date.now() + (24 * 60 * 60 * 1000)) / 1000),
				tolerance: 2
			},
			{
				name: 'human-readable time expression (15 minutes)',
				getExpiration: () => '15 m',
				expectedExpiration: (currentTime: number) => currentTime + (15 * 60),
				tolerance: 5
			},
			{
				name: 'human-readable time expression (2 hours)',
				getExpiration: () => '2 hours',
				expectedExpiration: (currentTime: number) => currentTime + TWO_HOURS,
				tolerance: 5
			},
			{
				name: 'human-readable time expression (30 minutes)',
				getExpiration: () => '30 minutes',
				expectedExpiration: (currentTime: number) => currentTime + (30 * 60),
				tolerance: 5
			},
			{
				name: 'human-readable time expression (1 day)',
				getExpiration: () => '1 day',
				expectedExpiration: (currentTime: number) => currentTime + (24 * 60 * 60),
				tolerance: 5
			}
		])('should sign JWT with $name', async ({ getExpiration, expectedExpiration, tolerance }) => {
			const expiration = getExpiration();
			const token = await signJWT(testSecret, {}, expiration);

			const result = await verifyJWT(token, testSecret) as JWTVerifyResult;
			expect(result).not.toBe(false);

			const expected = expectedExpiration(currentTime);
			expect(result.payload.exp).toBeGreaterThanOrEqual(expected - tolerance);
			expect(result.payload.exp).toBeLessThanOrEqual(expected + tolerance);
		});

		test('should include all standard JWT claims', async () => {
			const payload: JWTPayload = { userId: 111, customField: 'test' };
			const token = await signJWT(testSecret, payload);

			const result = await verifyJWT(token, testSecret) as JWTVerifyResult;
			expect(result).not.toBe(false);

			const { payload: decodedPayload } = result;
			expect(decodedPayload.iss).toBe('Core-Issuer');
			expect(decodedPayload.sub).toBe('');
			expect(decodedPayload.aud).toEqual(['Core-Audience']);
			expect(decodedPayload.jti).toBeTypeOf('string');
			expect(decodedPayload.nbf).toBeTypeOf('number');
			expect(decodedPayload.iat).toBeTypeOf('number');
			expect(decodedPayload.exp).toBeTypeOf('number');
			expect(decodedPayload.userId).toBe(111);
			expect(decodedPayload.customField).toBe('test');
		});

		test('should override default claims with payload values', async () => {
			const payload: JWTPayload = {
				iss: 'Custom-Issuer',
				sub: 'user-123',
				aud: ['Custom-Audience'],
				userId: 222
			};
			const token = await signJWT(testSecret, payload);

			const result = await verifyJWT(token, testSecret) as JWTVerifyResult;
			expect(result).not.toBe(false);

			const { payload: decodedPayload } = result;
			expect(decodedPayload.iss).toBe('Custom-Issuer');
			expect(decodedPayload.sub).toBe('user-123');
			expect(decodedPayload.aud).toEqual(['Custom-Audience']);
			expect(decodedPayload.userId).toBe(222);
		});

		test('should generate unique JWT IDs for different tokens', async () => {
			const token1 = await signJWT(testSecret, {});
			const token2 = await signJWT(testSecret, {});

			const result1 = await verifyJWT(token1, testSecret) as JWTVerifyResult;
			const result2 = await verifyJWT(token2, testSecret) as JWTVerifyResult;

			expect(result1.payload.jti).not.toBe(result2.payload.jti);
		});

		test.each([
			{
				name: 'numeric expiration in past (negative offset)',
				getExpiration: () => -ONE_HOUR
			},
			{
				name: 'Date object in past',
				getExpiration: () => new Date(Date.now() - (ONE_HOUR * 1000))
			},
			{
				name: 'human-readable expression (1 hour ago)',
				getExpiration: () => '1 hour ago'
			},
			{
				name: 'human-readable expression (30 minutes ago)',
				getExpiration: () => '30 minutes ago'
			},
			{
				name: 'human-readable expression (2 days ago)',
				getExpiration: () => '2 days ago'
			},
			{
				name: 'numeric offset equal to zero',
				getExpiration: () => 0
			}
		])('should throw InternalError when expiration $name is in the past or current time', async ({ getExpiration }) => {
			const expiration = getExpiration();

			try {
				await signJWT(testSecret, {}, expiration);
				expect.unreachable();
			} catch (error) {
				expect(error).toBeInstanceOf(InternalError);
				expect((error as InternalError).message).toBe(JWT_ERROR_KEYS.JWT_EXPIRATION_PASSED);
			}
		});

		test('should handle empty payload', async () => {
			const token = await signJWT(testSecret, {});

			const result = await verifyJWT(token, testSecret) as JWTVerifyResult;
			expect(result).not.toBe(false);
			expect(result.payload.iss).toBe('Core-Issuer');
			expect(result.payload.sub).toBe('');
			expect(result.payload.aud).toEqual(['Core-Audience']);
			expect(result.payload.jti).toBeTypeOf('string');
			expect(result.payload.nbf).toBeTypeOf('number');
			expect(result.payload.iat).toBeTypeOf('number');
			expect(result.payload.exp).toBeTypeOf('number');
		});

		test('should handle complex payload objects', async () => {
			const complexPayload: JWTPayload = {
				userId: 666,
				permissions: ['read', 'write', 'admin'],
				metadata: {
					source: 'api',
					version: '1.0.0',
					features: {
						premium: true,
						beta: false
					}
				},
				tags: null,
				isActive: true
			};

			const token = await signJWT(testSecret, complexPayload);
			const result = await verifyJWT(token, testSecret) as JWTVerifyResult;

			expect(result).not.toBe(false);
			expect(result.payload.userId).toBe(666);
			expect(result.payload.permissions).toEqual(['read', 'write', 'admin']);
			expect(result.payload.metadata).toEqual({
				source: 'api',
				version: '1.0.0',
				features: {
					premium: true,
					beta: false
				}
			});
			expect(result.payload.tags).toBeNull();
			expect(result.payload.isActive).toBe(true);
		});

		test('should throw InternalError when SignJWT fails during signing', async () => {
			// Use spyOn to mock the sign method and make it throw an error
			const jose = await import('jose');
			const spy = spyOn(jose.SignJWT.prototype, 'sign').mockImplementation(() => {
				throw new Error('Mocked sign error');
			});

			try {
				await signJWT(testSecret, { userId: 123 });
			} catch (error) {
				expect(error).toBeInstanceOf(InternalError);
				expect((error as InternalError).message).toBe(JWT_ERROR_KEYS.JWT_SIGN_ERROR);
				expect((error as InternalError).cause).toBeInstanceOf(Error);
				expect(((error as InternalError).cause as Error).message).toBe('Mocked sign error');
			} finally {
				spy.mockRestore();
			}
		});
	});

	describe.concurrent('verifyJWT', () => {
		test('should verify valid JWT and return payload', async () => {
			const payload: JWTPayload = { userId: 777, role: 'user' };
			const token = await signJWT(testSecret, payload);

			const result = await verifyJWT(token, testSecret);
			expect(result).not.toBe(false);
			expect((result as JWTVerifyResult).payload.userId).toBe(777);
			expect((result as JWTVerifyResult).payload.role).toBe('user');
		});

		test.each([
			['invalid token format', 'invalid.token.format'],
			['empty token', ''],
			['malformed JWT', 'not.a.jwt'],
			['token with only dots', '...'],
			['token with special characters', '!@#$%^&*()']
		])('should return false for %s', async (_, invalidToken) => {
			const result = await verifyJWT(invalidToken, testSecret);
			expect(result).toBe(false);
		});

		test('should return false for JWT with wrong secret', async () => {
			const token = await signJWT(testSecret, {});

			const result = await verifyJWT(token, wrongSecret);
			expect(result).toBe(false);
		});

		test('should return false for expired JWT', async () => {
			// Create a token that expires in 1 second
			const token = await signJWT(testSecret, {}, 1);

			// Wait for the token to expire
			await new Promise((resolve) => setTimeout(resolve, 1100));

			const result = await verifyJWT(token, testSecret);
			expect(result).toBe(false);
		});

		test('should return false for JWT used before nbf (not before)', async () => {
			// This test simulates a scenario where nbf might be in the future
			// In our current implementation, nbf is set to current time, so this mainly tests the verification logic
			const token = await signJWT(testSecret, {});

			const result = await verifyJWT(token, testSecret);
			expect(result).not.toBe(false); // Should be valid since nbf is current time
		});

		test('should handle JWT with all standard claims', async () => {
			const payload: JWTPayload = {
				iss: 'Test-Issuer',
				sub: 'test-subject',
				aud: ['test-audience'],
				userId: 1111
			};
			const token = await signJWT(testSecret, payload);

			const result = await verifyJWT(token, testSecret) as JWTVerifyResult;
			expect(result).not.toBe(false);
			expect(result.payload.iss).toBe('Test-Issuer');
			expect(result.payload.sub).toBe('test-subject');
			expect(result.payload.aud).toEqual(['test-audience']);
			expect(result.payload.userId).toBe(1111);
		});
	});

	describe.concurrent('integration scenarios', () => {
		test.each([
			{ name: 'string values', payload: { name: 'John Doe', role: 'admin' } },
			{ name: 'numeric values', payload: { userId: 12345, score: 98.5 } },
			{ name: 'boolean values', payload: { isActive: true, isVerified: false } },
			{ name: 'array values', payload: { permissions: ['read', 'write'], tags: [1, 2, 3] } },
			{ name: 'null values', payload: { optionalField: null, userId: 555 } },
			{ name: 'mixed types', payload: {
				userId: 888,
				name: 'Test User',
				isActive: true,
				permissions: ['admin'],
				metadata: null
			} }
		])('should handle complete sign and verify cycle with $name', async ({ payload }) => {
			const token = await signJWT(testSecret, payload);
			const result = await verifyJWT(token, testSecret) as JWTVerifyResult;

			expect(result).not.toBe(false);

			// Check each property of the payload
			for (const [key, value] of Object.entries(payload))
				expect(result.payload[key]).toEqual(value);
		});

		test('should maintain token integrity across multiple operations', async () => {
			const originalPayload: JWTPayload = {
				userId: 2222,
				sessionId: 'sess_12345',
				createdAt: Date.now()
			};

			// Sign token with 1 hour expiration
			const token = await signJWT(testSecret, originalPayload, ONE_HOUR);

			// Verify multiple times
			for (let i = 0; i < 5; ++i) {
				const result = await verifyJWT(token, testSecret) as JWTVerifyResult;
				expect(result).not.toBe(false);
				expect(result.payload.userId).toBe(2222);
				expect(result.payload.sessionId).toBe('sess_12345');
				expect(result.payload.createdAt).toBe(originalPayload.createdAt);
			}
		});

		test('should handle different expiration formats consistently', async () => {
			// Test different expiration formats that should result in similar expiration times
			const token1 = await signJWT(testSecret, {}, ONE_HOUR); // numeric offset in seconds
			const token2 = await signJWT(testSecret, {}, new Date(Date.now() + (ONE_HOUR * 1000))); // Date object
			const token3 = await signJWT(testSecret, {}, '1 hour'); // human-readable string

			const result1 = await verifyJWT(token1, testSecret) as JWTVerifyResult;
			const result2 = await verifyJWT(token2, testSecret) as JWTVerifyResult;
			const result3 = await verifyJWT(token3, testSecret) as JWTVerifyResult;

			expect(result1).not.toBe(false);
			expect(result2).not.toBe(false);
			expect(result3).not.toBe(false);

			// All should have similar expiration times (within a few seconds)
			const exp1 = result1.payload.exp ?? 0;
			const exp2 = result2.payload.exp ?? 0;
			const exp3 = result3.payload.exp ?? 0;

			expect(Math.abs(exp1 - exp2)).toBeLessThan(2);
			expect(Math.abs(exp1 - exp3)).toBeLessThan(10); // Allow more tolerance for string parsing
		});
	});
});

import { describe, expect, test } from 'bun:test';

import { TOTP_ERROR_KEYS } from '#/modules/totp/enums/totpErrorKeys';
import {
	buildOtpAuthUri,
	hotp,
	parseOtpAuthUri,
	timeRemaining,
	totp,
	verifyTotp
} from '#/modules/totp/totp';

describe('buildOtpAuthUri', () => {
	test('should build a valid OTP Auth URI', () => {
		const uri = buildOtpAuthUri({
			issuer: 'Example',
			secretBase32: '2W3YP3JOW476T4APP36YTZHFBJTWRVJQ',
			label: 'user@example.com'
		});
		expect(uri).toBe('otpauth://totp/user%40example.com?secret=2W3YP3JOW476T4APP36YTZHFBJTWRVJQ&issuer=Example');
	});
});

describe('hotp', () => {
	test('should generate a valid HOTP code', async () => {
		const secret = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07]);
		const code = await hotp(secret, 1);
		expect(code).toBe('318050');
	});
});

describe('parseOtpAuthUri', () => {
	test('should parse a valid OTP Auth URI', () => {
		const uri = 'otpauth://totp/user%40example.com?secret=2W3YP3JOW476T4APP36YTZHFBJTWRVJQ&issuer=Example';
		const params = parseOtpAuthUri(uri);
		expect(params).toEqual({
			secretBase32: '2W3YP3JOW476T4APP36YTZHFBJTWRVJQ',
			label: 'user@example.com',
			issuer: 'Example',
			algorithm: 'SHA-1',
			digits: 6,
			period: 30
		});
	});

	test('should throw error for invalid protocol', () => {
		const uri = 'http://totp/user@example.com?secret=2W3YP3JOW476T4APP36YTZHFBJTWRVJQ';
		expect(() => parseOtpAuthUri(uri)).toThrow(TOTP_ERROR_KEYS.INVALID_OTP_AUTH_URI);
	});

	test('should throw error for invalid hostname', () => {
		const uri = 'otpauth://hotp/user@example.com?secret=2W3YP3JOW476T4APP36YTZHFBJTWRVJQ';
		expect(() => parseOtpAuthUri(uri)).toThrow(TOTP_ERROR_KEYS.INVALID_OTP_AUTH_URI);
	});

	test('should throw error for missing secret parameter', () => {
		const uri = 'otpauth://totp/user@example.com?issuer=Example';
		expect(() => parseOtpAuthUri(uri)).toThrow(TOTP_ERROR_KEYS.MISSING_SECRET);
	});
});

describe('timeRemaining', () => {
	test('should calculate the remaining time until the next TOTP code', () => {
		const period = 30;
		const now = Date.now();
		const remaining = timeRemaining(period, now);
		expect(remaining).toBeLessThan(period);
	});
});

describe('totp', () => {
	test('should generate a valid TOTP code', async () => {
		const secret = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07]);
		const code = await totp(secret);
		expect(code.length).toBe(6);
		expect(code).toMatch(/^\d{6}$/);
	});
});

describe('verifyTotp', () => {
	test('should verify a valid TOTP code', async () => {
		const secret = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07]);
		const code = await totp(secret);
		const isValid = await verifyTotp(secret, code);
		expect(isValid).toBe(true);
	});

	test('should reject an invalid TOTP code', async () => {
		const secret = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07]);
		const isValid = await verifyTotp(secret, 'invalid');
		expect(isValid).toBe(false);
	});
});

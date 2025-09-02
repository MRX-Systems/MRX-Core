import { describe, expect, test } from 'bun:test';

import { TOTP_ERROR_KEYS } from '#/modules/totp/enums/totpErrorKeys';
import { buildOtpAuthUri, parseOtpAuthUri } from '#/modules/totp/otpAuthUri';

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
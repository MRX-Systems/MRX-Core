import { describe, expect, test } from 'bun:test';

import { TOTP_ERROR_KEYS } from '#/modules/totp/enums/totp-error-keys';
import { buildOtpAuthUri, parseOtpAuthUri } from '#/modules/totp/otp-auth-uri';

describe.concurrent('buildOtpAuthUri', () => {
	test('should build URI with defaults', () => {
		const uri = buildOtpAuthUri({
			secretBase32: 'JBSWY3DPEHPK3PXP',
			label: 'user@example.com'
		});
		expect(uri).toBe('otpauth://totp/user%40example.com?secret=JBSWY3DPEHPK3PXP');
	});

	test('should include issuer when provided', () => {
		const uri = buildOtpAuthUri({
			secretBase32: 'JBSWY3DPEHPK3PXP',
			label: 'user@example.com',
			issuer: 'Example'
		});
		expect(uri).toContain('issuer=Example');
	});

	test('should include non-default algorithm', () => {
		const uri = buildOtpAuthUri({
			secretBase32: 'JBSWY3DPEHPK3PXP',
			label: 'test',
			algorithm: 'SHA-256'
		});
		expect(uri).toContain('algorithm=SHA-256');
	});

	test('should include non-default digits', () => {
		const uri = buildOtpAuthUri({
			secretBase32: 'JBSWY3DPEHPK3PXP',
			label: 'test',
			digits: 8
		});
		expect(uri).toContain('digits=8');
	});

	test('should include non-default period', () => {
		const uri = buildOtpAuthUri({
			secretBase32: 'JBSWY3DPEHPK3PXP',
			label: 'test',
			period: 60
		});
		expect(uri).toContain('period=60');
	});
});

describe.concurrent('parseOtpAuthUri', () => {
	test('should parse URI with all parameters', () => {
		const uri = 'otpauth://totp/Example:user?secret=JBSWY3DP&issuer=Example&algorithm=SHA-256&digits=8&period=60';
		const params = parseOtpAuthUri(uri);
		expect(params).toEqual({
			secretBase32: 'JBSWY3DP',
			label: 'Example:user',
			issuer: 'Example',
			algorithm: 'SHA-256',
			digits: 8,
			period: 60
		});
	});

	test('should use defaults for missing optional params', () => {
		const uri = 'otpauth://totp/user?secret=JBSWY3DP';
		const params = parseOtpAuthUri(uri);
		expect(params.algorithm).toBe('SHA-1');
		expect(params.digits).toBe(6);
		expect(params.period).toBe(30);
	});

	test('should throw for invalid protocol', () => {
		expect(() => parseOtpAuthUri('http://totp/user?secret=ABC'))
			.toThrow(TOTP_ERROR_KEYS.INVALID_OTP_AUTH_URI);
	});

	test('should throw for hotp type', () => {
		expect(() => parseOtpAuthUri('otpauth://hotp/user?secret=ABC'))
			.toThrow(TOTP_ERROR_KEYS.INVALID_OTP_AUTH_URI);
	});

	test('should throw for missing secret', () => {
		expect(() => parseOtpAuthUri('otpauth://totp/user'))
			.toThrow(TOTP_ERROR_KEYS.MISSING_SECRET);
	});

	test('should throw for missing label', () => {
		expect(() => parseOtpAuthUri('otpauth://totp/?secret=ABC'))
			.toThrow(TOTP_ERROR_KEYS.MISSING_LABEL);
	});

	test('should throw for invalid algorithm', () => {
		expect(() => parseOtpAuthUri('otpauth://totp/user?secret=ABC&algorithm=MD5'))
			.toThrow(TOTP_ERROR_KEYS.INVALID_ALGORITHM);
	});

	test('should throw for invalid digits', () => {
		expect(() => parseOtpAuthUri('otpauth://totp/user?secret=ABC&digits=4'))
			.toThrow(TOTP_ERROR_KEYS.INVALID_DIGITS);
	});

	test('should throw for invalid period', () => {
		expect(() => parseOtpAuthUri('otpauth://totp/user?secret=ABC&period=0'))
			.toThrow(TOTP_ERROR_KEYS.INVALID_PERIOD);
	});
});
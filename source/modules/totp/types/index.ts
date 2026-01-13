export type { OtpAuthUri } from './otp-auth-uri';
export type { TotpOptions } from './totp-options';
export type { VerifyOptions } from './verify-options';

/**
 * Supported hash algorithms for TOTP/HOTP
 */
export type HashAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-512';

/**
 * Valid digit counts for OTP codes
 */
export type OtpDigits = 6 | 8;
export const TOTP_ERROR_KEYS = {
	INVALID_ALGORITHM: 'mrx.mrx-core.totp.error.invalid_algorithm',
	INVALID_BASE32_CHARACTER: 'mrx.mrx-core.totp.error.invalid_base32_character',
	INVALID_OTP_AUTH_URI: 'mrx.mrx-core.totp.error.invalid_otp_auth_uri',
	INVALID_SECRET_LENGTH: 'mrx.mrx-core.totp.error.invalid_secret_length',
	MISSING_SECRET: 'mrx.mrx-core.totp.error.missing_secret'
} as const;

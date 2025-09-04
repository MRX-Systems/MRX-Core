export const TOTP_ERROR_KEYS = {
	INVALID_ALGORITHM: 'totp.error.invalid_algorithm',
	INVALID_BASE32_CHARACTER: 'totp.error.invalid_base32_character',
	INVALID_OTP_AUTH_URI: 'totp.error.invalid_otp_auth_uri',
	INVALID_SECRET_LENGTH: 'totp.error.invalid_secret_length',
	MISSING_SECRET: 'totp.error.missing_secret'
} as const;

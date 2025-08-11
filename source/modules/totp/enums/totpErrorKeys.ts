export const TOTP_ERROR_KEYS = {
	INVALID_BASE32_CHARACTER: 'totp.error.invalid_base32_character',
	INVALID_SECRET_LENGTH: 'totp.error.invalid_secret_length',
	INVALID_ALGORITHM: 'totp.error.invalid_algorithm',
	INVALID_OTP_AUTH_URI: 'totp.error.invalid_otp_auth_uri',
	MISSING_SECRET: 'totp.error.missing_secret'
} as const;

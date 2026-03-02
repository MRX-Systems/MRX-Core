export const TOTP_ERROR_KEYS = {
	INVALID_ALGORITHM: 'nowarajs.totp.error.invalid_algorithm',
	INVALID_BASE32_CHARACTER: 'nowarajs.totp.error.invalid_base32_character',
	INVALID_DIGITS: 'nowarajs.totp.error.invalid_digits',
	INVALID_HMAC_LENGTH: 'nowarajs.totp.error.invalid_hmac_length',
	INVALID_OTP_AUTH_URI: 'nowarajs.totp.error.invalid_otp_auth_uri',
	INVALID_PERIOD: 'nowarajs.totp.error.invalid_period',
	INVALID_SECRET_LENGTH: 'nowarajs.totp.error.invalid_secret_length',
	INVALID_WINDOW: 'nowarajs.totp.error.invalid_window',
	MISSING_LABEL: 'nowarajs.totp.error.missing_label',
	MISSING_SECRET: 'nowarajs.totp.error.missing_secret',
	WEAK_SECRET: 'nowarajs.totp.error.weak_secret'
} as const;

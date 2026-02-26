export const JWT_ERROR_KEYS = {
	JWT_EXPIRATION_PASSED: 'nowarajs.jwt.error.expiration_passed',
	JWT_SECRET_TOO_WEAK: 'nowarajs.jwt.error.secret_too_weak',
	JWT_SIGN_ERROR: 'nowarajs.jwt.error.sign_error',
	JWT_EXPIRED: 'nowarajs.jwt.error.token_expired',
	JWT_CLAIM_VALIDATION_FAILED: 'nowarajs.jwt.error.claim_validation_failed',
	JWT_INVALID_SIGNATURE: 'nowarajs.jwt.error.invalid_signature',
	JWT_MALFORMED: 'nowarajs.jwt.error.malformed_token',
	JWT_VERIFICATION_FAILED: 'nowarajs.jwt.error.verification_failed'
} as const;
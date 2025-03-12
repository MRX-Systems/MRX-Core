/**
 * Elysia error key is a list of errors in the elysia context.
 */
export const ELYSIA_KEY_ERROR = {
    WRONG_EMAIL_OR_PASSWORD: 'core.error.elysia.wrong_email_or_password',
    WRONG_MFA: 'core.error.elysia.wrong_mfa_token',
    UNAUTHORIZED: 'core.error.elysia.unauthorized',
    RATE_LIMIT_EXCEEDED: 'core.error.rate_limit_exceeded',
    DYNAMIC_DATABASE_KEY_NOT_FOUND: 'core.error.elysia.dynamic_database_key_not_found',
    NEED_ADVANCED_SEARCH: 'core.error.elysia.need_advanced_search'
} as const;

/**
 * Elysia error key is a list of errors in the elysia context.
 */
export const ELYSIA_KEY_ERROR = {
    JWT_SIGN_ERROR: 'core.error.util.jwt_sign_error',
    JWT_SECRET_NOT_FOUND: 'core.error.util.jwt_secret_not_found',
    RATE_LIMIT_EXCEEDED: 'core.error.rate_limit_exceeded',
    DYNAMIC_DATABASE_KEY_NOT_FOUND: 'core.error.elysia.dynamic_database_key_not_found',
    NEED_ADVANCED_SEARCH: 'core.error.elysia.need_advanced_search'
} as const;

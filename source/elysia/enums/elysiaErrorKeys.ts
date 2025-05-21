export const elysiaErrorKeys = {
    /** Error when JWT signing fails. */
    jwtSignError: 'core.error.elysia.jwt_sign_error',
    /** Error when JWT secret is not found. */
    jwtSecretNotFound: 'core.error.elysia.jwt_secret_not_found',
    /** Error when rate limit is exceeded. */
    rateLimitExceeded: 'core.error.elysia.rate_limit_exceeded',
    /** Error when dynamic database key is not found in headers. */
    dynamicDatabaseKeyNotFound: 'core.error.elysia.dynamic_database_key_not_found',
    /** Error when advanced search is required but not provided. */
    needAdvancedSearch: 'core.error.elysia.need_advanced_search'
} as const;

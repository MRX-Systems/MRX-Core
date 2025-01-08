/**
 * Util error key is a list of errors in the util context.
 */
export const UTIL_KEY_ERROR: Record<string, [string, number]> = {
    INVALID_ENVIRONMENT: ['error.core.invalid_environment', 500]
} as const;

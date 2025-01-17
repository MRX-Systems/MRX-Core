/**
 * Config error key is a list of errors in the config context.
 */
export const CONFIG_KEY_ERROR= {
    FORMAT_ALREADY_EXISTS: ['error.core.validation.format.already_exists', 500],
    FORMAT_DOES_NOT_EXIST: ['error.core.validation.format.does_not_exist', 500]
} as const;

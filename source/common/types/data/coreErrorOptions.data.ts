/**
 * Represents the options for the Core error.
 */
export interface CoreErrorOptions {
    /**
     * The error key.
     */
    messageKey: string;

    /**
     * The status code.
     */
    code?: number;

    /**
     * The error detail.
     */
    detail?: unknown;
}

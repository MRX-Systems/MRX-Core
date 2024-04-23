/**
 * Represents the options for the Andesite error.
 */
export interface IAndesiteErrorOptions {
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
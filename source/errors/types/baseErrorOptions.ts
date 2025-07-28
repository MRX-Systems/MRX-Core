/**
 * Base options for all error types.
 *
 * @template TCause - The type of the cause of the error
 */
export interface BaseErrorOptions<TCause = unknown> {
	/**
	 * The error message describing what went wrong
	 */
	message?: string;

	/**
	 * The cause of the error, typically another error or additional context
	 */
	cause?: TCause;
}

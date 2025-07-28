import type { BaseErrorOptions } from './baseErrorOptions';

import type { HTTP_STATUS_CODES } from '#/errors/enums/httpStatusCodes';

/**
 * Options for HTTP-related errors.
 *
 * @template TCause - The type of the cause of the error
 */
export interface HttpErrorOptions<TCause = unknown> extends BaseErrorOptions<TCause> {
	/**
	 * The HTTP status code associated with the error
	 */
	httpStatusCode?: keyof typeof HTTP_STATUS_CODES | number;
}

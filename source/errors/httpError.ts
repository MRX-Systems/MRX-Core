import { BaseError } from './baseError';
import { HTTP_STATUS_CODES } from './enums/httpStatusCodes';
import type { HttpErrorOptions } from './types/httpErrorOptions';

export class HttpError<const TCause = unknown> extends BaseError<TCause> {
	private readonly _httpStatusCode: typeof HTTP_STATUS_CODES[keyof typeof HTTP_STATUS_CODES];

	public constructor(options?: Readonly<HttpErrorOptions<TCause>>) {
		super(options);
		super.name = 'HttpError';
		const statusCodeOption: keyof typeof HTTP_STATUS_CODES | typeof HTTP_STATUS_CODES[keyof typeof HTTP_STATUS_CODES] | undefined = options?.httpStatusCode;

		this._httpStatusCode = typeof statusCodeOption === 'number'
			? statusCodeOption
			: HTTP_STATUS_CODES[statusCodeOption ?? 'INTERNAL_SERVER_ERROR'] ?? HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;
	}

	public get httpStatusCode(): number {
		return this._httpStatusCode;
	}

	public get isClientError(): boolean {
		return this._httpStatusCode >= 400 && this._httpStatusCode < 500;
	}

	public get isServerError(): boolean {
		return this._httpStatusCode >= 500 && this._httpStatusCode < 600;
	}
}

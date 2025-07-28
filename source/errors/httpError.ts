import { BaseError } from './baseError';
import { HTTP_STATUS_CODES } from './enums/httpStatusCodes';
import type { HttpErrorOptions } from './types/httpErrorOptions';

export class HttpError<const TCause = unknown> extends BaseError<TCause> {
	private readonly _httpStatusCode: number;

	public constructor(options?: Readonly<HttpErrorOptions<TCause>>) {
		super(options);
		super.name = 'HttpError';
		const statusCodeOption: keyof typeof HTTP_STATUS_CODES | number | undefined = options?.httpStatusCode;

		if (typeof statusCodeOption === 'number')
			this._httpStatusCode = statusCodeOption;
		else
			this._httpStatusCode = HTTP_STATUS_CODES[statusCodeOption ?? 'INTERNAL_SERVER_ERROR'];
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

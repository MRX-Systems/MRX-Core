import { randomUUID } from 'crypto';

import type { BaseErrorOptions } from './types/baseErrorOptions';

export class BaseError<const TCause = unknown> extends Error {
	public override readonly cause: TCause | undefined;

	private readonly _uuid: string = randomUUID();

	private readonly _date: Date = new Date();

	public constructor(options?: Readonly<BaseErrorOptions<TCause>>) {
		super(options?.message, {
			cause: options?.cause
		});
		super.name = 'BaseError';
		this.cause = options?.cause;
	}

	public get uuid(): string {
		return this._uuid;
	}

	public get date(): Date {
		return this._date;
	}
}

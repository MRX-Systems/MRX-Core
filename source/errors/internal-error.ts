import { AppError } from './app-error';

export class InternalError<const TCause = unknown> extends AppError<TCause> {
	public constructor(message: string, cause?: TCause) {
		super(message, cause);
	}
}

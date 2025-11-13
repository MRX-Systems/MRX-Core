export class AppError<const TCause = unknown> extends Error {
	public override readonly cause: TCause | undefined;

	public readonly date: Date = new Date();

	public readonly uuid: string = Bun.randomUUIDv7();

	public constructor(message: string, cause?: TCause) {
		super(message, { cause });
		this.cause = cause;
		this.name = new.target.name;

		if (Error.captureStackTrace)
			Error.captureStackTrace(this, new.target);
	}
}

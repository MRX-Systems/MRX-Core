import type { BaseError } from '#/errors/base-error';

export interface LoggerEvent {
	error: [BaseError<{
		sinkName: string;
		object: unknown;
		error: Error;
	}>];
	end: [];
}
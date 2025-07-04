import type { CoreError } from '#/error';

export interface LoggerEvent {
	readonly error: [CoreError<{
		strategyName: string;
		object: unknown;
		error: Error;
	}>];
	readonly end: [];
}
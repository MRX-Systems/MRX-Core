import type { BaseError } from '#/errors/baseError';

export interface LoggerEvent {
	readonly error: [BaseError<{
		strategyName: string;
		object: unknown;
		error: Error;
	}>];
	readonly end: [];
}
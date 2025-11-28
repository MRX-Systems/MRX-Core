import type { InternalError } from '#/errors/internal-error';

export interface LoggerEvent {
	onBeforeExitError: [InternalError<{ error: Error }>];
	registerSinkError: [InternalError<{
		sinkName: string;
		error: Error;
	}>];
	sinkError: [InternalError<{
		sinkName: string;
		object?: unknown;
		error: Error;
	}>];
	drained: [];
}
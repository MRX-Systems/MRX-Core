import type { LogLevels } from './log-levels';
import type { SinkMap } from './sink-map';

/**
 * Internal log stream object for the queue.
 */
export interface LogStreamChunk<TLogObject, TSinks extends SinkMap> {
	/** ISO date string of the log event. */
	date: string;
	/** Log level. */
	level: LogLevels;
	/** The object to log. */
	object: TLogObject;
	/** Names of sinks to use. */
	sinksNames: (keyof TSinks)[];
}
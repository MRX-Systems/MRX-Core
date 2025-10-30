import type { LogLevels } from './log-levels';

export interface LoggerSink<
	TLogObject = unknown,
	TConfig = unknown
> {
	/** Optional configuration for the sink */
	readonly config?: TConfig;

	/**
	 * Logs a message with the sink's implementation.
	 * If you want to create your own sink, you must implement this method and all imports must be in the form of dynamic imports.
	 *
	 * @param level - The log level at which the message should be logged.
	 * @param timestamp - The date at which the message was logged.
	 * @param object - The object to log.
	 */
	log(level: LogLevels, timestamp: number, object: TLogObject): Promise<void> | void;

	/**
	 * Closes the sink and flushes any pending logs.
	 * This method is called when the logger is closing to ensure all resources are properly released.
	 * Optional - implement this if your sink needs cleanup (e.g., closing file handles, database connections).
	 */
	close?(): Promise<void> | void;
}

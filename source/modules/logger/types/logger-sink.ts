import type { LogLevels } from './log-levels';

export interface LoggerSink<TLogObject = unknown> {
	/**
	 * Logs a message with the sink's implementation.
	 *
	 * @param level - The log level at which the message should be logged.
	 * @param date - The date at which the message was logged.
	 * @param object - The object to log.
	 */
	log(level: LogLevels, date: Date, object: TLogObject): Promise<void> | void;
}

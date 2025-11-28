import type { LogLevels } from '#/modules/logger/types/log-levels';
import type { LoggerSink } from '#/modules/logger/types/logger-sink';

/**
* ConsoleLoggerSink implements LoggerSink to provide logging functionality to the console.
*/
export class ConsoleLoggerSink<TLogObject = unknown> implements LoggerSink<TLogObject> {
	public log(level: LogLevels, timestamp: number, object: TLogObject): void {
		const logEntry = { timestamp, level, content: object };
		const logLevel: Lowercase<LogLevels> = level.toLowerCase() as Lowercase<LogLevels>;
		console[logLevel]?.(JSON.stringify(logEntry));
	}
}

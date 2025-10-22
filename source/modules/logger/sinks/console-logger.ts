import type { LogLevels } from '#/modules/logger/types/log-levels';
import type { LoggerSink } from '#/modules/logger/types/logger-sink';

/**
* ConsoleLoggerSink implements LoggerSink to provide logging functionality to the console.
*/
export class ConsoleLoggerSink<TLogObject = unknown> implements LoggerSink<TLogObject> {
	public async log(level: LogLevels, timestamp: number, object: TLogObject): Promise<void> {
		const sanitizedContent: string = typeof object === 'string' ? object : JSON.stringify(object);
		await Bun.write(Bun.stdout, `{"timestamp":${timestamp},"level":"${level}","content":${sanitizedContent}}\n`);
	}
}

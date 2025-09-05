import { appendFile } from 'fs/promises';

import type { LogLevels } from '#/modules/logger/types/log-levels';
import type { LoggerSink } from '#/modules/logger/types/logger-sink';

/**
* FileLoggerSink implements LoggerSink to provide logging functionality to the file system.
*/
export class FileLoggerSink implements LoggerSink {
	/**
	* Path to the file to log to.
	*/
	private readonly _path: string;

	/**
	* Constructor FileLoggerSink
	*
	* @param path - Path to the file to log to.
	*/
	public constructor(path: string) {
		this._path = path;
	}

	/**
	* Logs a message to the file system with the specified log level.
	*
	* @param level - The log level at which the message should be logged.
	* @param date - The date at which the message was logged.
	* @param object - The object to log.
	*/
	public async log(level: LogLevels, date: Date, object: unknown): Promise<void> {
		const prefixDate = `[${date.toISOString().replace(/T/, ' ').replace(/\..+/, '')}]`;
		const sanitizedObject: string = typeof object === 'string' ? object : JSON.stringify(object);
		const message = `${prefixDate} ${level} : ${sanitizedObject}`;
		await appendFile(this._path, `${message}\n`);
	}
}

import { createWriteStream, type WriteStream } from 'node:fs';

import { BaseError } from '#/errors/base-error';
import type { LogLevels } from '#/modules/logger/types/log-levels';
import type { LoggerSink } from '#/modules/logger/types/logger-sink';
import { FILE_LOGGER_ERROR_KEYS } from './enums/file-logger-error-keys';

export interface FileLoggerConfig {
	/**
	 * Path to the file to log to.
	 */
	path: string;
	/**
	 * Buffer size before flushing to disk (default: 16KB)
	 * Higher = better throughput, lower = less memory
	 */
	bufferSize?: number;
}

/**
* FileLoggerSink implements LoggerSink to provide logging functionality to the file system.
* Uses a WriteStream for efficient buffered writes (like Pino's sonic-boom).
*/
export class FileLoggerSink<TLogObject = unknown> implements LoggerSink<TLogObject> {
	public readonly config: FileLoggerConfig;
	private readonly _stream: WriteStream;
	private _isClosed = false;

	public constructor(config: FileLoggerConfig) {
		this.config = config;

		this._stream = createWriteStream(config.path, {
			flags: 'a', // append mode
			encoding: 'utf8',
			highWaterMark: config.bufferSize ?? 16 * 1024 // 16KB par défaut
		});
	}

	public async log(level: LogLevels, timestamp: number, object: TLogObject): Promise<void> {
		if (this._isClosed)
			return;
		const sanitizedContent: string = typeof object === 'string' ? object : JSON.stringify(object);
		const message = `{"timestamp":${timestamp},"level":"${level}","content":${sanitizedContent}}\n`;
		const canContinue = this._stream.write(message);

		if (!canContinue)
			await new Promise<void>((resolve) => {
				this._stream.once('drain', resolve);
			});
	}

	public async close(): Promise<void> {
		if (this._isClosed)
			return;

		this._isClosed = true;

		return new Promise<void>((resolve, reject) => {
			this._stream.end((err: Error | null | undefined) => {
				if (err) reject(new BaseError(FILE_LOGGER_ERROR_KEYS.FAILED_TO_CLOSE_STREAM, err.message));
				else resolve();
			});
		});
	}
}


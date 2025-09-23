import { once } from 'events';
import { Transform } from 'stream';

import { BaseError } from '#/errors/base-error';
import { TypedEventEmitter } from '#/modules/typed-event-emitter/typed-event-emitter';
import { LOGGER_ERROR_KEYS } from './enums/logger-error-keys';
import type { LoggerEvent } from './events/logger-events';
import type { BodiesIntersection } from './types/bodies-intersection';
import type { LogLevels } from './types/log-levels';
import type { LogStreamChunk } from './types/log-stream-chunk';
import type { LoggerSink } from './types/logger-sink';
import type { SinkMap } from './types/sink-map';

/**
 * Logger provides a flexible, type-safe logging system that allows multiple sinks for log output.
 * The logger uses a transform stream to process log entries and execute the logging sinks.
 *
 * Logger extends the TypedEventEmitter class to emit typed events when an error occurs or when the logger ends.
 * The logger can log messages with different levels: error, warn, info, debug, and log.
 *
 * @template TSinks - The map of sink names to LoggerStrategy types.
 */
export class Logger<TSinks extends SinkMap = {}> extends TypedEventEmitter<LoggerEvent> {
	/**
	 * The map of sinks.
	 */
	private readonly _sinks: TSinks;

	/**
	 * The transform stream for processing log entries.
	 */

	private readonly _logStream: Transform;

	/**
	 * The queue of pending log entries.
	 */

	private readonly _pendingLogs: LogStreamChunk<unknown, TSinks>[] = [];

	/**
	 * The maximum number of pending logs.
	 * @defaultValue 10_000
	 */
	private readonly _maxPendingLogs;

	/**
	 * Flag to indicate if the logger is currently writing logs.
	 */
	private _isWriting = false;

	/**
	 * Construct a Logger.
	 *
	 * @template TStrategies - The map of sink names to LoggerStrategy types.
	 *
	 * @param sinks - Initial sinks map.
	 *
	 * @param maxPendingLogs - Maximum number of logs in the queue (default: 10_000)
	 */
	public constructor(sinks: TSinks = {} as TSinks, maxPendingLogs = 10_000) {
		super();
		this._sinks = sinks;
		this._maxPendingLogs = maxPendingLogs;
		this._logStream = new Transform({
			objectMode: true,
			transform: (chunk: LogStreamChunk<unknown, TSinks>, _, callback): void => {
				this._executeStrategies(chunk.level, new Date(chunk.date), chunk.object, chunk.sinksNames)
					.then(() => callback())
					.catch((error: unknown) => {
						this.emit('error', error as BaseError<{
							sinkName: string;
							object: unknown;
							error: Error;
						}>);
						callback();
					});
			}
		});
	}

	/**
	 * Register a new logging sink.
	 *
	 * @template Key - The name of the sink.
	 * @template Sink - The sink type.
	 *
	 * @param name - The name of the sink.
	 * @param sink - The sink to add. It must implement {@link LoggerSink}.
	 *
	 * @throws ({@link BaseError}) - If the sink is already added.
	 *
	 * @returns A new Logger instance with the added sink.
	 */
	public registerSink<Key extends string, Sink extends LoggerSink>(
		name: Key,
		sink: Sink
	): Logger<TSinks & Record<Key, Sink>> {
		if ((this._sinks as Record<string, LoggerSink>)[name])
			throw new BaseError(LOGGER_ERROR_KEYS.SINK_ALREADY_ADDED, { sinkName: name });
		return new Logger({
			...this._sinks,
			[name]: sink
		}, this._maxPendingLogs);
	}

	/**
	 * Unregister a logging sink.
	 *
	 * @template Key - The name of the sink.
	 *
	 * @param name - The name of the sink to remove.
	 *
	 * @throws ({@link BaseError}) - If the sink is not found.
	 *
	 * @returns A new Logger instance without the removed sink.
	 */
	public unregisterSink<Key extends keyof TSinks>(
		name: Key
	): Logger<Omit<TSinks, Key>> {
		if (!(name in this._sinks))
			throw new BaseError(LOGGER_ERROR_KEYS.SINK_NOT_FOUND, { sinkName: name });
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { [name]: _, ...rest } = this._sinks;
		return new Logger(rest, this._maxPendingLogs);
	}

	/**
	 * Register multiple sinks at once.
	 *
	 * @template TNew - The new sinks to add.
	 *
	 * @param sinks - An array of tuples where each tuple contains the sink name and the sink instance.
	 *
	 * @throws ({@link BaseError}) - If any sink is already added.
	 *
	 * @returns A new Logger instance with the added sinks.
	 */
	public registerSinks<TNew extends [string, LoggerSink][] = [string, LoggerSink][]>(
		sinks: TNew
	): Logger<TSinks & { [K in TNew[number][0]]: Extract<TNew[number], [K, LoggerSink]>[1] }> {
		return sinks.reduce(
			(logger, [name, sink]) => logger.registerSink(name, sink), this as unknown as Logger<SinkMap>
		) as unknown as Logger<TSinks & { [K in TNew[number][0]]: Extract<TNew[number], [K, LoggerSink]>[1] }>;
	}

	/**
	 * Unregister multiple sinks at once.
	 *
	 * @template Keys - The names of the sinks to remove.
	 *
	 * @param names - An array of sink names to remove.
	 *
	 * @throws ({@link BaseError}) - If any sink is not found.
	 *
	 * @returns A new Logger instance without the removed sinks.
	 */
	public unregisterSinks<Keys extends Extract<keyof TSinks, string>>(
		names: Keys[]
	): Logger<Omit<TSinks, Keys>> {
		let logger: Logger<SinkMap> = this as unknown as Logger<SinkMap>;
		for (const name of names)
			logger = logger.unregisterSink(name) as unknown as Logger<SinkMap>;
		return logger as unknown as Logger<Omit<TSinks, Keys>>;
	}

	/**
	 * Remove all sinks.
	 *
	 * @returns A new Logger instance without any sinks.
	 */
	public clearSinks(): Logger {
		return new Logger({}, this._maxPendingLogs);
	}

	/**
	 * Log an error message.
	 *
	 * @template SNames - The names of the sinks to use.
	 *
	 * @param object - The object to log.
	 * @param sinksNames - The names of the sinks to use. If not provided, all sinks will be used.
	 *
	 * @throws ({@link BaseError}) - If no sink is added.
	 */
	public error<SNames extends (keyof TSinks)[] = (keyof TSinks)[]>(
		object: BodiesIntersection<TSinks, SNames[number]>,
		sinksNames?: SNames
	): void {
		this._out('ERROR', object, sinksNames);
	}

	/**
	 * Log a warning message.
	 *
	 * @template SNames - The names of the sinks to use.
	 *
	 * @param object - The object to log.
	 * @param sinksNames - The names of the sinks to use. If not provided, all sinks will be used.
	 *
	 * @throws ({@link BaseError}) - If no sink is added.
	 */
	public warn<SNames extends (keyof TSinks)[] = (keyof TSinks)[]>(
		object: BodiesIntersection<TSinks, SNames[number]>,
		sinksNames?: SNames
	): void {
		this._out('WARN', object, sinksNames);
	}

	/**
	 * Log an info message.
	 *
	 * @template SNames - The names of the sinks to use.
	 *
	 * @param object - The object to log.
	 * @param sinksNames - The names of the sinks to use. If not provided, all sinks will be used.
	 *
	 * @throws ({@link BaseError}) - If no sink is added.
	 */
	public info<SNames extends (keyof TSinks)[] = (keyof TSinks)[]>(
		object: BodiesIntersection<TSinks, SNames[number]>,
		sinksNames?: SNames
	): void {
		this._out('INFO', object, sinksNames);
	}

	/**
	 * Log a debug message.
	 *
	 * @template SNames - The names of the sinks to use.
	 *
	 * @param object - The object to log.
	 * @param sinksNames - The names of the sinks to use. If not provided, all sinks will be used.
	 *
	 * @throws ({@link BaseError}) - If no sink is added.
	 */
	public debug<SNames extends (keyof TSinks)[] = (keyof TSinks)[]>(
		object: BodiesIntersection<TSinks, SNames[number]>,
		sinksNames?: SNames
	): void {
		this._out('DEBUG', object, sinksNames);
	}

	/**
	 * Log a generic message.
	 *
	 * @template SNames - The names of the sinks to use.
	 *
	 * @param object - The object to log.
	 * @param sinksNames - The names of the sinks to use. If not provided, all sinks will be used.
	 *
	 * @throws ({@link BaseError}) - If no sink is added.
	 */
	public log<SNames extends (keyof TSinks)[] = (keyof TSinks)[]>(
		object: BodiesIntersection<TSinks, SNames[number]>,
		sinksNames?: SNames
	): void {
		this._out('LOG', object, sinksNames);
	}

	/**
	 * Internal: execute all sinks for a log event.
	 *
	 * @template TLogObject - The type of the log object.
	 *
	 * @param level - The log level.
	 * @param date - The date of the log event.
	 * @param object - The object to log.
	 * @param sinksNames - The names of the sinks to use. If not provided, all sinks will be used.
	 *
	 * @throws ({@link BaseError}) - If a sink throws.
	 */
	private async _executeStrategies<TLogObject>(
		level: LogLevels,
		date: Date,
		object: TLogObject,
		sinksNames: (keyof TSinks)[]
	): Promise<void> {
		await Promise.all(sinksNames.map(async (name) => {
			try {
				await (this._sinks[name] as LoggerSink<TLogObject> | undefined)?.log(level, date, object);
			} catch (error) {
				throw new BaseError(LOGGER_ERROR_KEYS.SINK_ERROR, { sinkName: name, object, error });
			}
		}));
	}

	/**
	 * Internal: queue a log event and start writing if not already.
	 *
	 * @template TLogObject - The type of the log object.
	 *
	 * @param level - The log level.
	 * @param object - The object to log.
	 * @param sinksNames - The names of the sinks to use. If not provided, all sinks will be used.
	 *
	 * @throws ({@link BaseError}) - If no sink is added.
	 */
	private _out<TLogObject>(
		level: LogLevels,
		object: TLogObject,
		sinksNames?: (keyof TSinks)[]
	): void {
		const sinkKeys = Object.keys(this._sinks) as (keyof TSinks)[];
		if (sinkKeys.length === 0)
			throw new BaseError(LOGGER_ERROR_KEYS.NO_SINK_ADDED, { level, object });
		if (this._pendingLogs.length >= this._maxPendingLogs)
			return;
		const log: LogStreamChunk<TLogObject, TSinks> = {
			date: new Date().toISOString(),
			level,
			object,
			sinksNames: sinksNames ? sinksNames : sinkKeys
		};
		this._pendingLogs.push(log);
		if (!this._isWriting) {
			this._isWriting = true;
			setImmediate(() => {
				void this._writeLog();
			});
		}
	}

	/**
	 * Internal: process the log queue and emit 'end' when done.
	 */
	private async _writeLog(): Promise<void> {
		while (this._pendingLogs.length > 0) {
			const pendingLog = this._pendingLogs.shift();
			if (!pendingLog) continue;
			const canWrite = this._logStream.write(pendingLog);
			if (!canWrite)
				await once(this._logStream, 'drain');
		}
		this._isWriting = false;
		this.emit('end');
	}
}
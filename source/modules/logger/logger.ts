import type { BunMessageEvent } from 'bun';

import { BaseError } from '#/errors/base-error';
import { TypedEventEmitter } from '#/modules/typed-event-emitter/typed-event-emitter';
import { LOGGER_ERROR_KEYS } from './enums/logger-error-keys';
import type { LoggerEvent } from './events/logger-events';
import type { LogLevels } from './types/log-levels';
import type { LoggerOptions } from './types/logger-options';
import type { LoggerSink } from './types/logger-sink';
import type { SinkBodiesIntersection } from './types/sink-bodies-intersection';
import type { SinkMap } from './types/sink-map';

/**
 * Pending log message corresponding to a log entry waiting to be processed by the worker.
 */
interface PendingLogMessage {
	readonly sinkNames: string[];
	readonly level: LogLevels;
	readonly timestamp: number;
	readonly object: unknown;
}

type WorkerResponseMessage
	= | { type: 'BATCH_COMPLETE'; }
		| { type: 'REGISTER_SINK_ERROR'; sinkName: string; error: Error; }
		| { type: 'SINK_LOG_ERROR'; sinkName: string; error: Error; object: unknown; }
		| { type: 'SINK_CLOSE_ERROR'; sinkName: string; error: Error; }
		| { type: 'CLOSE_COMPLETE'; };

export class Logger<TSinks extends SinkMap = {}> extends TypedEventEmitter<LoggerEvent> {
	/**
	 * Map of registered sinks (logging destinations)
	 */
	private readonly _sinks: TSinks;
	/**
	 * List of registered sink keys for quick access
	 */
	private readonly _sinkKeys: (keyof TSinks)[] = [];
	/**
	 * Worker instance handling log processing
	 */
	private readonly _worker: Worker;
	/**
	 * Maximum number of pending log messages allowed in the queue
	 */
	private readonly _maxPendingLogs: number;
	/**
	 * Maximum number of messages in flight to the worker
	 */
	private readonly _maxMessagesInFlight: number;
	/**
	 * Number of logs to batch before sending to worker
	 */
	private readonly _batchSize: number;
	/**
	 * Timeout in milliseconds before flushing incomplete batch
	 */
	private readonly _batchTimeout: number;
	/**
	 * Whether to auto flush and close on process exit
	 */
	private readonly _autoEnd: boolean;
	/**
	 * Whether to flush before process exit
	 */
	private readonly _flushOnBeforeExit: boolean;

	// State managed only by root logger
	/**
	 * Queue of pending log messages
	 */
	private readonly _pendingLogs: PendingLogMessage[] = [];
	/**
	 * Number of log messages currently being processed by the worker
	 */
	private _messagesInFlight = 0;
	/**
	 * Timer for batching log messages
	 */
	private _batchTimer: Timer | null = null;
	/**
	 * Whether the logger is currently writing log messages to the worker
	 */
	private _isWriting = false;
	/**
	 * Resolvers for flush promises
	 */
	private readonly _flushResolvers: (() => void)[] = [];
	/**
	 * Resolver for the close promise
	 */
	private _closeResolver: (() => void) | null = null;
	/**
	 * Resolver for backpressure when maxMessagesInFlight is reached
	 */
	private _backpressureResolver: (() => void) | null = null;
	/**
	 * Handle the exit event
	 */
	private readonly _handleExit = (): void => {
		this._worker.terminate();
	};
	/**
	 * Handle the worker close event
	 */
	private readonly _handleWorkerClose = (): void => {
		process.off('beforeExit', this._handleBeforeExit);
		process.off('exit', this._handleExit);
	};

	/**
	 * Creates a new Logger instance with the specified options.
	 *
	 * @param options - Configuration options for the logger
	 */
	public constructor(options?: LoggerOptions) {
		super();
		const {
			autoEnd = true,
			batchSize = 50,
			batchTimeout = 0.1,
			flushOnBeforeExit = true,
			maxMessagesInFlight = 100,
			maxPendingLogs = 10_000
		} = options ?? {};
		this._sinks = {} as TSinks;
		this._maxPendingLogs = maxPendingLogs;
		this._maxMessagesInFlight = maxMessagesInFlight;
		this._batchSize = batchSize;
		this._batchTimeout = batchTimeout;
		this._autoEnd = autoEnd;
		this._flushOnBeforeExit = flushOnBeforeExit;
		this._worker = new Worker(new URL('worker-logger.ts', import.meta.url).href, { type: 'module' }); // create a new worker
		this._setupWorkerMessages(); // setup message handling from the worker
		if (this._autoEnd)
			this._setupAutoEnd(); // setup auto-end on process exit
	}

	/**
	 * Registers a new sink (logging destination) with the logger.
	 *
	 * @param sinkName - The name of the sink
	 * @param sinkConstructor - The sink class constructor
	 * @param sinkArgs - The sink constructor arguments
	 *
	 * @returns The logger instance with new type (for chaining)
	 */
	public registerSink<
		TSinkName extends string,
		TSink extends LoggerSink,
		TSinkArgs extends unknown[]
	>(
		sinkName: TSinkName,
		sinkConstructor: new (...args: TSinkArgs) => TSink,
		...sinkArgs: TSinkArgs
	): Logger<TSinks & Record<TSinkName, new (...args: TSinkArgs) => TSink>> {
		if (this._sinks[sinkName as keyof TSinks])
			throw new BaseError(LOGGER_ERROR_KEYS.SINK_ALREADY_ADDED);
		this._worker.postMessage({
			type: 'REGISTER_SINK',
			sinkName,
			sinkClassName: sinkConstructor.name,
			sinkClassString: sinkConstructor.toString(),
			sinkArgs
		});
		this._sinks[sinkName as keyof TSinks] = sinkConstructor as unknown as TSinks[keyof TSinks];
		this._sinkKeys.push(sinkName as keyof TSinks);
		return this as unknown as Logger<TSinks & Record<TSinkName, new (...args: TSinkArgs) => TSink>>;
	}

	/**
	 * Logs a message at the ERROR level to the specified sinks.
	 *
	 * @param object - The log message object
	 * @param sinkNames - Optional array of sink names to log to; logs to all sinks if omitted
	 */
	public error<SNames extends (keyof TSinks)[] = (keyof TSinks)[]>(
		object: SinkBodiesIntersection<TSinks, SNames[number]>,
		sinkNames: SNames = this._sinkKeys as SNames
	): void {
		this._enqueue('ERROR', object, sinkNames);
	}

	/**
	 * Logs a message at the WARN level to the specified sinks.
	 *
	 * @param object - The log message object
	 * @param sinkNames - Optional array of sink names to log to; logs to all sinks if omitted
	 */
	public warn<SNames extends (keyof TSinks)[] = (keyof TSinks)[]>(
		object: SinkBodiesIntersection<TSinks, SNames[number]>,
		sinkNames: SNames = this._sinkKeys as SNames
	): void {
		this._enqueue('WARN', object, sinkNames);
	}

	/**
	 * Logs a message at the INFO level to the specified sinks.
	 *
	 * @param object - The log message object
	 * @param sinkNames - Optional array of sink names to log to; logs to all sinks if omitted
	 */
	public info<SNames extends (keyof TSinks)[] = (keyof TSinks)[]>(
		object: SinkBodiesIntersection<TSinks, SNames[number]>,
		sinkNames: SNames = this._sinkKeys as SNames
	): void {
		this._enqueue('INFO', object, sinkNames);
	}

	/**
	 * Logs a message at the DEBUG level to the specified sinks.
	 *
	 * @param object - The log message object
	 * @param sinkNames - Optional array of sink names to log to; logs to all sinks if omitted
	 */
	public debug<SNames extends (keyof TSinks)[] = (keyof TSinks)[]>(
		object: SinkBodiesIntersection<TSinks, SNames[number]>,
		sinkNames: SNames = this._sinkKeys as SNames
	): void {
		this._enqueue('DEBUG', object, sinkNames);
	}

	/**
	 * Logs a message at the TRACE level to the specified sinks.
	 *
	 * @param object - The log message object
	 * @param sinkNames - Optional array of sink names to log to; logs to all sinks if omitted
	 */
	public log<SNames extends (keyof TSinks)[] = (keyof TSinks)[]>(
		object: SinkBodiesIntersection<TSinks, SNames[number]>,
		sinkNames: SNames = this._sinkKeys as SNames
	): void {
		this._enqueue('LOG', object, sinkNames);
	}

	/**
	 * Flushes all pending logs and waits for them to be processed.
	 */
	public async flush(): Promise<void> {
		if (this._pendingLogs.length === 0 && this._messagesInFlight === 0)
			return;

		return new Promise<void>((resolve) => {
			this._flushResolvers.push(resolve);

			if (!this._isWriting && this._pendingLogs.length > 0) {
				this._isWriting = true;
				void this._processPendingLogs();
			}
		});
	}

	/**
	 * Closes the logger, flushes pending logs, and releases resources.
	 */
	public async close(): Promise<void> {
		await this.flush();

		return new Promise<void>((resolve) => {
			this._closeResolver = resolve;
			this._worker.postMessage({ type: 'CLOSE' });
		});
	}

	/**
	 * Enqueues a log message to be processed by the worker.
	 *
	 * @param level - The log level
	 * @param object - The log message object
	 * @param sinkNames - Optional array of sink names to log to; logs to all sinks if omitted
	 */
	private _enqueue<TLogObject>(
		level: LogLevels,
		object: TLogObject,
		sinkNames?: (keyof TSinks)[]
	): void {
		if (this._sinkKeys.length === 0)
			throw new BaseError(LOGGER_ERROR_KEYS.NO_SINKS_PROVIDED, { level, object });

		if (this._pendingLogs.length >= this._maxPendingLogs)
			return;

		this._pendingLogs.push({
			sinkNames: (sinkNames ?? this._sinkKeys) as string[],
			level,
			timestamp: Date.now(),
			object
		});

		// If the batch size is reached, trigger immediate processing
		if (this._pendingLogs.length >= this._batchSize) {
			if (this._batchTimer !== null) {
				clearTimeout(this._batchTimer);
				this._batchTimer = null;
			}
			this._triggerProcessing();
		} else if (this._batchTimeout > 0 && this._batchTimer === null) {
			// Otherwise, start a timer if not already started
			this._batchTimer = setTimeout(() => {
				this._batchTimer = null;
				this._triggerProcessing();
			}, this._batchTimeout);
		}
	}

	/**
	 * Triggers processing of pending logs.
	 */
	private _triggerProcessing(): void {
		if (this._isWriting)
			return;
		this._isWriting = true;
		void this._processPendingLogs();
	}

	/**
	 * Processes pending log messages by sending them to the worker in batches.
	 */
	private async _processPendingLogs(): Promise<void> {
		while (this._pendingLogs.length > 0) {
			if (this._messagesInFlight >= this._maxMessagesInFlight)
				await new Promise<void>((resolve) => {
					this._backpressureResolver = resolve;
				});
			const batch = this._pendingLogs.splice(0, this._batchSize);
			this._messagesInFlight++;
			this._worker.postMessage({
				type: 'LOG_BATCH',
				logs: batch
			});
		}

		this._isWriting = false;
		this.emit('drained');
	}

	/**
	 * Releases a batch by decrementing the in-flight counter and resolving backpressure if needed.
	 */
	private _releaseBatch(): void {
		this._messagesInFlight--;

		if (this._backpressureResolver !== null) {
			this._backpressureResolver();
			this._backpressureResolver = null;
		}
	}

	/**
	 * Sets up message handling for the worker.
	 */
	private _setupWorkerMessages(): void {
		this._worker.addEventListener('message', (event: BunMessageEvent<WorkerResponseMessage>) => {
			switch (event.data.type) {
				case 'BATCH_COMPLETE':
					this._releaseBatch();

					if (this._messagesInFlight === 0 && this._pendingLogs.length === 0 && this._flushResolvers.length > 0) {
						for (const resolve of this._flushResolvers)
							resolve();
						this._flushResolvers.length = 0;
					}
					break;

				case 'SINK_LOG_ERROR':
					this.emit('sinkError', new BaseError(
						LOGGER_ERROR_KEYS.SINK_LOG_ERROR,
						event.data
					));

					this._releaseBatch();
					break;

				case 'SINK_CLOSE_ERROR':
					this.emit('sinkError', new BaseError(
						LOGGER_ERROR_KEYS.SINK_CLOSE_ERROR,
						event.data
					));
					break;

				case 'REGISTER_SINK_ERROR':
					this.emit('registerSinkError', new BaseError(
						LOGGER_ERROR_KEYS.REGISTER_SINK_ERROR,
						event.data
					));
					break;

				case 'CLOSE_COMPLETE':
					this._worker.terminate();
					if (this._closeResolver) {
						this._closeResolver();
						this._closeResolver = null;
					}
					break;
			}
		});
	}

	/**
	 * Sets up automatic flushing and closing of the logger on process exit.
	 */
	private _setupAutoEnd(): void {
		process.on('beforeExit', this._handleBeforeExit);
		process.on('exit', this._handleExit);
		this._worker.addEventListener('close', this._handleWorkerClose);
	}

	/**
	 * Handles the beforeExit event.
	 */
	private readonly _handleBeforeExit = (): void => {
		if (this._flushOnBeforeExit)
			void this.flush()
				.then(() => this.close())
				.catch((error: unknown) => {
					this.emit('onBeforeExitError', new BaseError(
						LOGGER_ERROR_KEYS.BEFORE_EXIT_FLUSH_ERROR,
						{ error: error as Error }
					));
				});
		else
			void this.close().catch((error: unknown) => {
				this.emit('onBeforeExitError', new BaseError(
					LOGGER_ERROR_KEYS.BEFORE_EXIT_CLOSE_ERROR,
					{ error: error as Error }
				));
			});
	};
}
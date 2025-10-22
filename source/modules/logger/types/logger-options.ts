/**
 * Configuration options for the Logger instance.
 */
export interface LoggerOptions {
	/**
	 * Maximum number of log messages that can be queued in memory before dropping new logs.
	 * @default 10_000
	 */
	maxPendingLogs?: number;

	/**
	 * Maximum number of messages that can be sent to the worker without acknowledgment.
	 * Controls backpressure to prevent overwhelming the worker thread.
	 * @default 100
	 */
	maxMessagesInFlight?: number;

	/**
	 * Maximum number of logs to batch together before sending to the worker.
	 * Higher values = better throughput but higher latency.
	 * @default 100
	 */
	batchSize?: number;

	/**
	 * Maximum time in milliseconds to wait before flushing a partial batch.
	 * Prevents logs from being delayed indefinitely when batch size is not reached.
	 * Set to 0 to disable time-based flushing.
	 * @default 0.1 (100 microseconds)
	 */
	batchTimeout?: number;

	/**
	 * Whether to automatically flush and close the logger when the process exits.
	 * When enabled, hooks are installed on `process.on('beforeExit')` and `process.on('exit')`.
	 * @default true
	 */
	autoEnd?: boolean;

	/**
	 * Whether to flush pending logs before the process exits.
	 * Only applies when `autoEnd` is true.
	 * @default true
	 */
	flushOnBeforeExit?: boolean;
}

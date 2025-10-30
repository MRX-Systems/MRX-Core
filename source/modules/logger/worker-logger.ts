import type { BunMessageEvent } from 'bun';

import type { LoggerSink } from './types/logger-sink';
import type { LogLevels } from './types/log-levels';

interface LogEntry {
	readonly sinkNames: string[];
	readonly level: LogLevels;
	readonly timestamp: number;
	readonly object: unknown;
}

type WorkerMessage
	= | {
		type: 'REGISTER_SINK';
		sinkName: string;
		sinkClassName: string;
		sinkClassString: string;
		sinkArgs: unknown[];
	}
	| {
		type: 'LOG_BATCH';
		logs: LogEntry[];
	}
	| { type: 'CLOSE'; };

export const workerFunction = (): void => {
	const sinks: Record<string, LoggerSink> = {};
	const self: Worker = globalThis as unknown as Worker;

	/**
	 * Process a single log entry across multiple sinks concurrently
	 */
	const processLogEntry = async (log: LogEntry): Promise<void> => {
		await Promise.all(
			log.sinkNames.map(async (sinkName) => {
				const sink = sinks[sinkName];
				if (!sink)
					return;

				try {
					await sink.log(log.level, log.timestamp, log.object);
				} catch (error) {
					self.postMessage({
						type: 'SINK_LOG_ERROR',
						sinkName,
						error,
						object: log.object
					});
				}
			})
		);
	};

	// eslint-disable-next-line @typescript-eslint/no-misused-promises
	self.addEventListener('message', async (
		event: BunMessageEvent<WorkerMessage>
	) => {
		switch (event.data.type) {
			case 'REGISTER_SINK': {
				const {
					sinkName,
					sinkClassName,
					sinkClassString,
					sinkArgs
				} = event.data;

				try {
					// Create a function to evaluate the class string and instantiate the sink

					const factory = new Function('sinkArgs', `
						${sinkClassString}
						return new ${sinkClassName}(...sinkArgs);
					`) as (sinkArgs: unknown[]) => LoggerSink;

					sinks[sinkName] = factory(sinkArgs);
				} catch (error) {
					self.postMessage({
						type: 'REGISTER_SINK_ERROR',
						sinkName,
						error
					});
				}
				break;
			}
			case 'LOG_BATCH': {
				const { logs } = event.data;
				try {
					for (const log of logs)
						await processLogEntry(log);
				} finally {
					self.postMessage({ type: 'BATCH_COMPLETE' });
				}
				break;
			}
			case 'CLOSE': {
				await Promise.all(
					Object.entries(sinks).map(async ([name, sink]) => {
						try {
							await sink.close?.();
						} catch (error) {
							self.postMessage({
								type: 'SINK_CLOSE_ERROR',
								sinkName: name,
								error
							});
						}
					})
				);
				self.postMessage({ type: 'CLOSE_COMPLETE' });
				break;
			}
		}
	});
};
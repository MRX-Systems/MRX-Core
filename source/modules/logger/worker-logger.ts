import type { BunMessageEvent } from 'bun';

import type { LoggerSink } from './types/logger-sink';
import type { LogLevels } from './types/log-levels';

interface LogEntry {
	readonly sinkNames: string[];
	readonly level: LogLevels;
	readonly timestamp: number;
	readonly object: unknown;
}

type WorkerMessage =
	| {
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
	| { type: 'CLOSE' };

export const workerFunction = (): void => {
	const sinks: Record<string, LoggerSink> = {};
	const self: Worker = globalThis as unknown as Worker;

	/**
	 * Process a single log entry across all target sinks
	 */
	const processLogEntry = (log: LogEntry): void => {
		const { sinkNames, level, timestamp, object } = log;
		const len = sinkNames.length;
		for (let i = 0; i < len; ++i) {
			const sinkName = sinkNames[i];
			const sink = sinks[sinkName];
			if (!sink) continue;

			try {
				const result = sink.log(level, timestamp, object);
				// Handle async sinks - catch rejected promises
				if (result instanceof Promise)
					result.catch((error: unknown) => {
						self.postMessage({
							type: 'SINK_LOG_ERROR',
							sinkName,
							error,
							object
						});
					});
			} catch (error) {
				// Handle sync errors
				self.postMessage({
					type: 'SINK_LOG_ERROR',
					sinkName,
					error,
					object
				});
			}
		}
	};

	self.addEventListener('message', (event: BunMessageEvent<WorkerMessage>) => {
		switch (event.data.type) {
			case 'REGISTER_SINK': {
				const { sinkName, sinkClassName, sinkClassString, sinkArgs } = event.data;

				try {
					// Create a function to evaluate the class string and instantiate the sink
					const factory = new Function(
						'sinkArgs',
						`
						${sinkClassString}
						return new ${sinkClassName}(...sinkArgs);
					`
					) as (sinkArgs: unknown[]) => LoggerSink;

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
				const len = logs.length;
				for (let i = 0; i < len; ++i) processLogEntry(logs[i]);
				self.postMessage({ type: 'BATCH_COMPLETE' });
				break;
			}
			case 'CLOSE': {
				const entries = Object.entries(sinks);
				for (const [name, sink] of entries)
					try {
						void sink.close?.();
					} catch (error) {
						self.postMessage({
							type: 'SINK_CLOSE_ERROR',
							sinkName: name,
							error
						});
					}

				self.postMessage({ type: 'CLOSE_COMPLETE' });
				break;
			}
			default:
				break;
		}
	});
};

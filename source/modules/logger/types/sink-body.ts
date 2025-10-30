import type { LoggerSink } from './logger-sink';

export type SinkBody<TSink, Key extends keyof TSink>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	= TSink[Key] extends new (...args: any[]) => LoggerSink<infer TBody>
		? TBody
		: TSink[Key] extends LoggerSink<infer TBody>
			? TBody
			: never;
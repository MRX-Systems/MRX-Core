import type { LoggerSink } from './logger-sink';

// export type SinkMap = Record<string, LoggerSink>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SinkMap = Record<string, new (...args: any[]) => LoggerSink>;
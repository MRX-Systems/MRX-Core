import type { LoggerSink } from './logger-sink';

export type SinkBody<TSink, Key extends keyof TSink> =TSink[Key] extends LoggerSink<infer TBody> ? TBody : never;

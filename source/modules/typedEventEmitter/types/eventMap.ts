/**
 * Defines a map of event names to their payload types.
 * @remarks
 * Use this interface to specify the shape of events for TypedEventEmitter.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventMap = Record<string | number | symbol, any>;
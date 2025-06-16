import type { LogLevels } from './logLevels';
import type { StrategyMap } from './strategyMap';

/**
 * Internal log stream object for the queue.
 */
export interface LogStreamChunk<TLogObject, TStrategies extends StrategyMap> {
    /** ISO date string of the log event. */
    readonly date: string;
    /** Log level. */
    readonly level: LogLevels;
    /** The object to log. */
    readonly object: TLogObject;
    /** Names of strategies to use. */
    readonly strategiesNames: (keyof TStrategies)[];
}
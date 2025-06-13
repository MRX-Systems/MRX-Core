import type { CoreError } from '#/error';

export interface LoggerEvent {
    error: [CoreError<{
        strategyName: string;
        object: unknown;
        error: Error;
    }>];
    end: [];
}
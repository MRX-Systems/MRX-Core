import { randomUUID } from 'crypto';

/**
 * Represents the options for the Core error.
 */
export interface CoreErrorOptions<T = unknown> {
    /**
     * The error key.
     * @defaultValue ['error.unknown', 500]
     */
    key?: readonly [string, number] | undefined;
    /**
     * The cause of the error.
     */
    cause?: T;
}

const DEFAULT_ERROR_MESSAGE = 'error.unknown';
const DEFAULT_ERROR_CODE = 500;


/**
 * Core error class that extends the ({@link Error}) class and provides additional properties. (uuidError, date, code, fileName, line, column)
 *
 * @typeparam T - The type of the cause of the error.
 *
 * @example
 * The following example demonstrates how to throw a new instance of the Core error.
 * ```typescript
 * try {
 *   throw new CoreError();
 * } catch (error) {
 *  console.log(error instanceof CoreError); // true
 *  console.log(error instanceof Error); // true
 *  // u can access to uuidError, date, code, fileName, line, column, message, name, stack, cause
 * }
 * ```
 * @example
 * The following example demonstrates how to create a new instance of the Core error with provided type for the cause.
 * ```typescript
 * const coreError: CoreError<{ foo: 'bar' }> = new CoreError({
 *     key: 'error.unknown',
 *     cause: {
 *         foo: 'bar',
 *     },
 * });
 * console.log(coreError.cause); // { foo: 'bar' } if you make ctrl + space after cause. you will see the properties of the cause
 * ```
 */
export class CoreError<T = unknown> extends Error {
    public override readonly cause: T | undefined;

    /**
     * The unique identifier of the error.
     * This identifier is used to track the error in the logs.
     */
    private readonly _uuidError: string = randomUUID();

    /**
     * The date when the error was created.
     */
    private readonly _date: Date = new Date();

    /**
     * The error code. (HTTP status code)
     */
    private readonly _code: number;

    /**
     * The fileName where the error occurred (if available).
     */
    private readonly _fileName: string = '';

    /**
     * The line number where the error occurred (if available).
     */
    private readonly _line: number = 0;

    /**
     * The column number where the error occurred (if available).
     */
    private readonly _column: number = 0;

    /**
     * Creates a new instance of the Core error.
     *
     * @param coreErrorOptions - The options for the Core error. ({@link CoreErrorOptions})
     */
    public constructor(coreErrorOptions?: Readonly<CoreErrorOptions<T>>) {
        super(coreErrorOptions?.key?.[0] || DEFAULT_ERROR_MESSAGE);
        super.name = 'CoreError';
        this.cause = coreErrorOptions?.cause;
        this._code = coreErrorOptions?.key?.[1] || DEFAULT_ERROR_CODE;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
            const stackLine = this.stack?.split('\n')[1]?.trim();
            const match = stackLine?.match(/:(\d+):(\d+)\)$/);
            this._fileName = stackLine?.split('(')[1]?.split(':')[0] || '';
            if (match) {
                this._line = match[1] ? parseInt(match[1], 10) : 0;
                this._column = match[2] ? parseInt(match[2], 10) : 0;
            }
        }
    }

    /**
     * Gets the unique identifier of the error.
     */
    public get uuidError(): string {
        return this._uuidError;
    }

    /**
     * Gets the date when the error was created.
     */
    public get date(): Date {
        return this._date;
    }

    /**
     * Gets the fileName where the error occurred (if available).
     */
    public get fileName(): string {
        return this._fileName;
    }

    /**
     * Gets the line number where the error occurred (if available).
     */
    public get line(): number {
        return this._line;
    }

    /**
     * Gets the column number where the error occurred (if available).
     */
    public get column(): number {
        return this._column;
    }

    /**
     * Gets the error code.
     */
    public get code(): number {
        return this._code;
    }
}

import { randomUUID } from 'crypto';

import { type IAndesiteErrorOptions } from '@/Common/Interface';

/**
 * AndesiteError is a class that represents an error entity with a unique identifier.
 */
export class AndesiteError extends Error {
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
     * The error code.
     */
    private readonly _code: number;
    /**
     * The error detail.
     */
    private readonly _detail: unknown;

    /**
     * Creates a new instance of the ErrorEntity class.
     *
     * @param andesiteErrorOptions - The options to create the error entity.
     */
    public constructor(andesiteErrorOptions: IAndesiteErrorOptions) {
        super();
        this._code = andesiteErrorOptions.code ?? 500;
        this.message = andesiteErrorOptions.messageKey;
        this._detail = andesiteErrorOptions.detail;
        if (Error.captureStackTrace)
            Error.captureStackTrace(this, this.constructor);
    }

    /**
     * Gets the unique identifier of the error.
     * @returns The unique identifier of the error.
     */
    public get uuidError(): string {
        return this._uuidError;
    }

    /**
     * Gets the date when the error was created.
     * @returns The date when the error was created.
     */
    public get date(): Date {
        return this._date;
    }

    /**
     * Gets the error code.
     * @returns The error code.
     */
    public get code(): number {
        return this._code;
    }

    /**
     * Gets the error detail.
     * @returns The error detail.
     */
    public get detail(): unknown {
        return this._detail;
    }
}

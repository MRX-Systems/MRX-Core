import { randomUUID } from 'crypto';

/**
 * ErrorEntity is a class that represents an error entity with a unique identifier.
 */
export class ErrorEntity extends Error {
    /**
     * The unique identifier of the error.
     * This identifier is used to track the error in the logs.
     */
    private readonly _uuidError: string = randomUUID();
    /**
     * The name of the error entity.
     */
    private readonly _name: string;
    /**
     * The error code.
     */
    private readonly _code: string;
    /**
     * The error detail.
     */
    private readonly _detail?: unknown;

    /**
     * Creates a new instance of the ErrorEntity class.
     *
     * @param code - The error code.
     * @param detail - The error detail.
     */
    public constructor(code: string, detail?: unknown) {
        super();
        this._name = this.constructor.name;
        this._code = code;
        this.message = code;
        this._detail = detail;
        if (Error.captureStackTrace)
            Error.captureStackTrace(this, this.constructor);
    }

    /**
     * Gets the error code.
     * @returns The error code.
     */
    public get code(): string {
        return this._code;
    }

    /**
     * Gets the error name.
     * @returns The error name.
     */
    public override get name(): string {
        return this._name;
    }

    /**
     * Gets the error detail.
     * @returns The error detail.
     */
    public get detail(): unknown {
        return this._detail;
    }

    /**
     * Gets the unique identifier of the error.
     * @returns The unique identifier of the error.
     */
    public get uuidError(): string {
        return this._uuidError;
    }
}

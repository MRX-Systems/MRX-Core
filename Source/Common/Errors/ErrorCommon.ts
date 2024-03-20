import { ErrorEntity } from './ErrorEntity';

/**
 * ErrorCommonCode is an enum that contains the error codes for the Common layer
 */
export enum ErrorCommonCode {
    I18N_INIT_FAILED = 'I18N_INIT_FAILED',
    I18N_NOT_INITIALIZED = 'I18N_NOT_INITIALIZED',
}

/**
 * ErrorCommon is a class that extends ErrorEntity and is used to throw errors in the Common layer
 */
export class ErrorCommon extends ErrorEntity {

    /**
     * 
     * @param code - The code of the error to throw
     * @param detail - The detail of the error to throw (optional)
     */
    public constructor(code: string, detail?: unknown) {
        super(code, detail);
    }
}
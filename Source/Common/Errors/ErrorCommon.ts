import { ErrorEntity } from './ErrorEntity';

/**
 * ErrorCommonCode is an enum that contains the error codes for the Common layer
 */
export enum ErrorCommonCode {
    I18N_INIT_FAILED = 'I18N_INIT_FAILED',
    I18N_NOT_INITIALIZED = 'I18N_NOT_INITIALIZED',
    I18N_IS_ALREADY_INITIALIZED = 'I18N_IS_ALREADY_INITIALIZED',
}

/**
 * ErrorCommon is a class that extends ErrorEntity and is used to throw errors in the Common layer
 */
export class ErrorCommon extends ErrorEntity {}
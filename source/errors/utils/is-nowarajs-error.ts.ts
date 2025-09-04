import { BaseError } from '#/base-error';
import { HttpError } from '#/http-error';

export const isBaseError = (e: unknown): e is BaseError => e instanceof BaseError;

export const isHttpError = (e: unknown): e is HttpError => e instanceof HttpError;

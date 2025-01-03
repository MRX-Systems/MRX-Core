/* eslint-disable new-cap */
import { FormatRegistry } from '@sinclair/typebox';
import { SetErrorFunction, ValueErrorType, type ErrorFunctionParameter } from '@sinclair/typebox/errors';
import EventEmitter from 'node:events';

import { CoreError } from '#/common/error/core.error.ts';
import { CONFIG_ERRORS } from '#/common/error/key/config.error.ts';

/**
 * Singleton class to manage TypeBox configuration, including custom formats, error messages, and event handling.
 *
 * This class use the `@sinclair/typebox` library. (@see https://github.com/sinclairzx81/typebox)
 *
 * It extends the ({@link EventEmitter}) class to allow for event-based handling of format registration and unregistration.
 */
class TypeBoxConfigSingleton extends EventEmitter {
    /**
     * Private static instance of the singleton class.
     * Ensures only one instance is created.
     */
    private static _instance: TypeBoxConfigSingleton;

    /**
     * Default error messages mapped to error types defined in `ValueErrorType`. ({@link ValueErrorType})
     */
    private readonly _defaultErrorTypeAndMessage: Record<ValueErrorType, string> = {
        [ValueErrorType.ArrayContains]: 'error.core.validation.array.contains',
        [ValueErrorType.ArrayMaxContains]: 'error.core.validation.array.max_contains',
        [ValueErrorType.ArrayMaxItems]: 'error.core.validation.array.max_items',
        [ValueErrorType.ArrayMinContains]: 'error.core.validation.array.min_contains',
        [ValueErrorType.ArrayMinItems]: 'error.core.validation.array.min_items',
        [ValueErrorType.ArrayUniqueItems]: 'error.core.validation.array.unique_items',
        [ValueErrorType.Array]: 'error.core.validation.array.is_array',
        [ValueErrorType.AsyncIterator]: 'error.core.validation.async_iterator.is_async_iterator',
        [ValueErrorType.BigIntExclusiveMaximum]: 'error.core.validation.bigint.exclusive_maximum',
        [ValueErrorType.BigIntExclusiveMinimum]: 'error.core.validation.bigint.exclusive_minimum',
        [ValueErrorType.BigIntMaximum]: 'error.core.validation.bigint.maximum',
        [ValueErrorType.BigIntMinimum]: 'error.core.validation.bigint.minimum',
        [ValueErrorType.BigIntMultipleOf]: 'error.core.validation.bigint.multiple_of',
        [ValueErrorType.BigInt]: 'error.core.validation.bigint.is_bigint',
        [ValueErrorType.Boolean]: 'error.core.validation.boolean.is_boolean',
        [ValueErrorType.DateExclusiveMinimumTimestamp]: 'error.core.validation.date.exclusive_minimum_timestamp',
        [ValueErrorType.DateExclusiveMaximumTimestamp]: 'error.core.validation.date.exclusive_maximum_timestamp',
        [ValueErrorType.DateMinimumTimestamp]: 'error.core.validation.date.minimum_timestamp',
        [ValueErrorType.DateMaximumTimestamp]: 'error.core.validation.date.maximum_timestamp',
        [ValueErrorType.DateMultipleOfTimestamp]: 'error.core.validation.date.multiple_of_timestamp',
        [ValueErrorType.Date]: 'error.core.validation.date.is_date',
        [ValueErrorType.Function]: 'error.core.validation.function.is_function',
        [ValueErrorType.IntegerExclusiveMaximum]: 'error.core.validation.integer.exclusive_maximum',
        [ValueErrorType.IntegerExclusiveMinimum]: 'error.core.validation.integer.exclusive_minimum',
        [ValueErrorType.IntegerMaximum]: 'error.core.validation.integer.maximum',
        [ValueErrorType.IntegerMinimum]: 'error.core.validation.integer.minimum',
        [ValueErrorType.IntegerMultipleOf]: 'error.core.validation.integer.multiple_of',
        [ValueErrorType.Integer]: 'error.core.validation.integer.is_integer',
        [ValueErrorType.IntersectUnevaluatedProperties]: 'error.core.validation.intersect.unevaluated_properties',
        [ValueErrorType.Intersect]: 'error.core.validation.intersect.is_intersect',
        [ValueErrorType.Iterator]: 'error.core.validation.iterator.is_iterator',
        [ValueErrorType.Literal]: 'error.core.validation.literal.is_literal',
        [ValueErrorType.Never]: 'error.core.validation.never.is_never',
        [ValueErrorType.Not]: 'error.core.validation.not.not_match',
        [ValueErrorType.Null]: 'error.core.validation.null.is_null',
        [ValueErrorType.NumberExclusiveMaximum]: 'error.core.validation.number.exclusive_maximum',
        [ValueErrorType.NumberExclusiveMinimum]: 'error.core.validation.number.exclusive_minimum',
        [ValueErrorType.NumberMaximum]: 'error.core.validation.number.maximum',
        [ValueErrorType.NumberMinimum]: 'error.core.validation.number.minimum',
        [ValueErrorType.NumberMultipleOf]: 'error.core.validation.number.multiple_of',
        [ValueErrorType.Number]: 'error.core.validation.number.is_number',
        [ValueErrorType.Object]: 'error.core.validation.object.is_object',
        [ValueErrorType.ObjectAdditionalProperties]: 'error.core.validation.object.additional_properties',
        [ValueErrorType.ObjectMaxProperties]: 'error.core.validation.object.max_properties',
        [ValueErrorType.ObjectMinProperties]: 'error.core.validation.object.min_properties',
        [ValueErrorType.ObjectRequiredProperty]: 'error.core.validation.object.required_property',
        [ValueErrorType.Promise]: 'error.core.validation.promise.is_promise',
        [ValueErrorType.RegExp]: 'error.core.validation.regexp.not_match',
        [ValueErrorType.StringFormatUnknown]: 'error.core.validation.string.format_unknown',
        [ValueErrorType.StringFormat]: 'error.core.validation.string.format',
        [ValueErrorType.StringMaxLength]: 'error.core.validation.string.max_length',
        [ValueErrorType.StringMinLength]: 'error.core.validation.string.min_length',
        [ValueErrorType.StringPattern]: 'error.core.validation.string.pattern',
        [ValueErrorType.String]: 'error.core.validation.string.is_string',
        [ValueErrorType.Symbol]: 'error.core.validation.symbol.is_symbol',
        [ValueErrorType.TupleLength]: 'error.core.validation.tuple.length',
        [ValueErrorType.Tuple]: 'error.core.validation.tuple.is_tuple',
        [ValueErrorType.Uint8ArrayMaxByteLength]: 'error.core.validation.uint8array.max_byte_length',
        [ValueErrorType.Uint8ArrayMinByteLength]: 'error.core.validation.uint8array.min_byte_length',
        [ValueErrorType.Uint8Array]: 'error.core.validation.uint8array.is_uint8array',
        [ValueErrorType.Undefined]: 'error.core.validation.undefined.is_undefined',
        [ValueErrorType.Union]: 'error.core.validation.union.is_union',
        [ValueErrorType.Void]: 'error.core.validation.void.is_void',
        [ValueErrorType.Kind]: 'error.core.validation.kind.is_kind'
    };

    /**
     * Maps registered formats to their respective error message keys.     */
    private _errorFormatAndMessage: Record<string, string> = {};

    /**
     * Retrieves the singleton instance of the class.
     *
     * @returns The single instance of the configuration class. ({@link TypeBoxConfigSingleton}) 
     */
    public static get instance(): TypeBoxConfigSingleton {
        if (!TypeBoxConfigSingleton._instance)
            TypeBoxConfigSingleton._instance = new TypeBoxConfigSingleton();
        return TypeBoxConfigSingleton._instance;
    }

    /**
     * Initializes the default error function for validation errors.
     */
    public init(): void {
        SetErrorFunction((error: ErrorFunctionParameter): string => this._defaultErrorFunction(error));
    }

    /**
     * Registers a custom format for validation.
     *
     * @param name - The name of the custom format.
     * @param format - A function that validates the format.
     * @param messageKey - The key for the error message associated with this format.
     *
     * @throws ({@link CoreError}) If the format is already registered. (FORMAT_ALREADY_EXISTS in {@link CONFIG_ERRORS})
     */
    public registerFormat(name: string, format: (value: string) => boolean, messageKey?: string): void {
        if (FormatRegistry.Has(name))
            throw new CoreError({
                key: CONFIG_ERRORS.FORMAT_ALREADY_EXISTS,
                cause: { name }
            });
        FormatRegistry.Set(name, format);
        if (messageKey)
            this._errorFormatAndMessage[name] = messageKey;
        this.emit('register', name);
    }

    /**
     * Unregisters a previously registered format.
     *
     * @param name - The name of the format to remove.
     *
     * @throws ({@link CoreError}) If the format does not exist. (FORMAT_DOES_NOT_EXIST in {@link CONFIG_ERRORS})
     */
    public unregisterFormat(name: string): void {
        if (!FormatRegistry.Has(name))
            throw new CoreError({
                key: CONFIG_ERRORS.FORMAT_DOES_NOT_EXIST,
                cause: { name }
            });
        FormatRegistry.Delete(name);
        if (this._errorFormatAndMessage[name])
            delete this._errorFormatAndMessage[name];
        this.emit('unregister', name);
    }

    /**
     * Retrieves a list of all registered formats.
     *
     * @returns An array of registered format names.
     */
    public get formats(): string[] {
        return Array.from(FormatRegistry.Entries())
            .map(([name]: [string, unknown]) => name);
    }

    /**
     * Handles string format errors by returning the appropriate error message.
     *
     * @param error - The error parameter from validation. ({@link ErrorFunctionParameter})
     *
     * @returns - The error message for the string format error.
     */
    private _handleStringFormatError(error: ErrorFunctionParameter): string {
        if (error.schema.format && this._errorFormatAndMessage[error.schema.format])
            return this._errorFormatAndMessage[error.schema.format] as string;
        return this._defaultErrorTypeAndMessage[ValueErrorType.StringFormat];
    }

    /**
     * Default error handling function for validation errors.
     *
     * @param error - The error parameter from validation.
     *
     * @returns The appropriate error message for the validation error.
     */
    private _defaultErrorFunction(error: ErrorFunctionParameter): string {
        if (error.schema.message)
            return (error.schema.message as string).replace(/\[(.*?)\]/g, () => `${error.value}`);
        if (error.errorType === ValueErrorType.StringFormat)
            return this._handleStringFormatError(error);
        return this._defaultErrorTypeAndMessage[error.errorType];
    }
}

/**
 * Singleton instance of the TypeBoxConfig class.
 */
export const TypeBoxConfig = TypeBoxConfigSingleton.instance;

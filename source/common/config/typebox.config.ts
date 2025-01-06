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
        /**
         * Interpolation :
         * - `max` - The maximum number of items allowed.
         */
        [ValueErrorType.ArrayMaxContains]: 'error.core.validation.array.max_contains',
        /**
         * Interpolation :
         * - `max` - The maximum number of items allowed.
         * - `length` - The number of items in the array.
         */
        [ValueErrorType.ArrayMaxItems]: 'error.core.validation.array.max_items',
        /**
         * Interpolation :
         * - `min` - The minimum number of items allowed.
         */
        [ValueErrorType.ArrayMinContains]: 'error.core.validation.array.min_contains',
        /**
         * Interpolation :
         * - `min` - The minimum number of items allowed.
         * - `length` - The number of items in the array.
         */
        [ValueErrorType.ArrayMinItems]: 'error.core.validation.array.min_items',
        [ValueErrorType.ArrayUniqueItems]: 'error.core.validation.array.unique_items',
        /**
         * Interpolation :
         * - `type` - The type of the item.
         */
        [ValueErrorType.Array]: 'error.core.validation.array.is_array',
        /**
         * Interpolation :
         * - `type` - The type of the item.
         */
        [ValueErrorType.AsyncIterator]: 'error.core.validation.async_iterator.is_async_iterator',
        /**
         * Interpolation :
         * - `max` - The maximum value allowed.
         * - `value` - The value that was greater than the maximum.
         */
        [ValueErrorType.BigIntExclusiveMaximum]: 'error.core.validation.bigint.exclusive_maximum',
        /**
         * Interpolation :
         * - `min` - The minimum value allowed.
         * - `value` - The value that was less than the minimum.
         */
        [ValueErrorType.BigIntExclusiveMinimum]: 'error.core.validation.bigint.exclusive_minimum',
        /**
         * Interpolation :
         * - `max` - The maximum value allowed.
         * - `value` - The value that was greater than the maximum.
         */
        [ValueErrorType.BigIntMaximum]: 'error.core.validation.bigint.maximum',
        /**
         * Interpolation :
         * - `min` - The minimum value allowed.
         * - `value` - The value that was less than the minimum.
         */
        [ValueErrorType.BigIntMinimum]: 'error.core.validation.bigint.minimum',
        /**
         * Interpolation :
         * - `multiple` - The multiple that the value should be divisible by.
         * - `value` - The value that was not divisible by the multiple.
         */
        [ValueErrorType.BigIntMultipleOf]: 'error.core.validation.bigint.multiple_of',
        /**
         * Interpolation :
         * - `type` - The type of the value.
         */
        [ValueErrorType.BigInt]: 'error.core.validation.bigint.is_bigint',
        /**
         * Interpolation :
         * - `type` - The type of the value.
         */
        [ValueErrorType.Boolean]: 'error.core.validation.boolean.is_boolean',
        /**
         * Interpolation :
         * - `min` - The minimum value allowed.
         * - `value` - The value that was less than the minimum.
         */
        [ValueErrorType.DateExclusiveMinimumTimestamp]: 'error.core.validation.date.exclusive_minimum_timestamp',
        /**
         * Interpolation :
         * - `max` - The maximum value allowed.
         * - `value` - The value that was greater than the maximum.
         */
        [ValueErrorType.DateExclusiveMaximumTimestamp]: 'error.core.validation.date.exclusive_maximum_timestamp',
        /**
         * Interpolation :
         * - `min` - The minimum value allowed.
         * - `value` - The value that was less than the minimum.
         */
        [ValueErrorType.DateMinimumTimestamp]: 'error.core.validation.date.minimum_timestamp',
        /**
         * Interpolation :
         * - `max` - The maximum value allowed.
         * - `value` - The value that was greater than the maximum.
         */
        [ValueErrorType.DateMaximumTimestamp]: 'error.core.validation.date.maximum_timestamp',
        /**
         * Interpolation :
         * - `multiple` - The multiple that the value should be divisible by.
         * - `value` - The value that was not a date.
         */
        [ValueErrorType.DateMultipleOfTimestamp]: 'error.core.validation.date.multiple_of_timestamp',
        /**
         * Interpolation :
         * - `type` - The type of the value.
         */
        [ValueErrorType.Date]: 'error.core.validation.date.is_date',
        /**
         * Interpolation :
         * - `type` - The type of the value.
         */
        [ValueErrorType.Function]: 'error.core.validation.function.is_function',
        /**
         * Interpolation :
         * - `max` - The maximum value allowed.
         * - `value` - The value that was greater than the maximum.
         */
        [ValueErrorType.IntegerExclusiveMaximum]: 'error.core.validation.integer.exclusive_maximum',
        /**
         * Interpolation :
         * - `min` - The minimum value allowed.
         * - `value` - The value that was less than the minimum.
         */
        [ValueErrorType.IntegerExclusiveMinimum]: 'error.core.validation.integer.exclusive_minimum',
        /**
         * Interpolation :
         * - `max` - The maximum value allowed.
         * - `value` - The value that was greater than the maximum.
         */
        [ValueErrorType.IntegerMaximum]: 'error.core.validation.integer.maximum',
        /**
         * Interpolation :
         * - `min` - The minimum value allowed.
         * - `value` - The value that was less than the minimum.
         */
        [ValueErrorType.IntegerMinimum]: 'error.core.validation.integer.minimum',
        /**
         * Interpolation :
         * - `multiple` - The multiple that the value should be divisible by.
         * - `value` - The value that was not divisible by the multiple.
         */
        [ValueErrorType.IntegerMultipleOf]: 'error.core.validation.integer.multiple_of',
        /**
         * Interpolation :
         * - `type` - The type of the value.
         */
        [ValueErrorType.Integer]: 'error.core.validation.integer.is_integer',
        /**
         * Interpolation :
         * - `props` - The properties that were not evaluated.
         */
        [ValueErrorType.IntersectUnevaluatedProperties]: 'error.core.validation.intersect.unevaluated_properties',
        [ValueErrorType.Intersect]: 'error.core.validation.intersect.is_intersect',
        /**
         * Interpolation :
         * - `type` - The type of the value.
         */
        [ValueErrorType.Iterator]: 'error.core.validation.iterator.is_iterator',
        /**
         * Interpolation :
         * - `type` - The type of the value.
         */
        [ValueErrorType.Literal]: 'error.core.validation.literal.is_literal',
        /**
         * Interpolation :
         * - `type` - The type of the value.
         */
        [ValueErrorType.Never]: 'error.core.validation.never.is_never',
        [ValueErrorType.Not]: 'error.core.validation.not.not_match',
        /**
         * Interpolation :
         * - `type` - The type of the value.
         */
        [ValueErrorType.Null]: 'error.core.validation.null.is_null',
        /**
         * Interpolation :
         * - `max` - The maximum number allowed.
         * - `value` - The value that was greater than the maximum.
         */
        [ValueErrorType.NumberExclusiveMaximum]: 'error.core.validation.number.exclusive_maximum',
        /**
         * Interpolation :
         * - `min` - The minimum number allowed.
         * - `value` - The value that was less than the minimum.
         */
        [ValueErrorType.NumberExclusiveMinimum]: 'error.core.validation.number.exclusive_minimum',
        /**
         * Interpolation :
         * - `max` - The maximum number allowed.
         * - `value` - The value that was greater or equal than the maximum.
         */
        [ValueErrorType.NumberMaximum]: 'error.core.validation.number.maximum',
        /**
         * Interpolation :
         * - `min` - The minimum number allowed.
         * - `value` - The value that was less or equal than the minimum.
         */
        [ValueErrorType.NumberMinimum]: 'error.core.validation.number.minimum',
        /**
         * Interpolation :
         * - `multiple` - The multiple that the value should be divisible by.
         * - `value` - The value that was not divisible by the multiple.
         */
        [ValueErrorType.NumberMultipleOf]: 'error.core.validation.number.multiple_of',
        /**
         * Interpolation :
         * - `type` - The type of the value.
         */
        [ValueErrorType.Number]: 'error.core.validation.number.is_number',
        /**
         * Interpolation :
         * - `type` - The type of the value.
         */
        [ValueErrorType.Object]: 'error.core.validation.object.is_object',
        /**
         * Interpolation :
         * - `props` - The properties that were not evaluated.
         */
        [ValueErrorType.ObjectAdditionalProperties]: 'error.core.validation.object.additional_properties',
        /**
         * Interpolation :
         * - `max` - The maximum number of properties allowed.
         * - `value` - The number of properties in the object.
         */
        [ValueErrorType.ObjectMaxProperties]: 'error.core.validation.object.max_properties',
        /**
         * Interpolation :
         * - `min` - The minimum number of properties allowed.
         * - `value` - The number of properties in the object.
         */
        [ValueErrorType.ObjectMinProperties]: 'error.core.validation.object.min_properties',
        /**
         * Interpolation :
         * - `key` - The key property that was missing.
         */
        [ValueErrorType.ObjectRequiredProperty]: 'error.core.validation.object.required_property',
        /**
         * Interpolation :
         * - `type` - The type of the value.
         */
        [ValueErrorType.Promise]: 'error.core.validation.promise.is_promise',
        /**
         * Interpolation :
         * - `pattern` - The pattern that the value should match.
         * - `value` - The value that did not match the pattern.
         */
        [ValueErrorType.RegExp]: 'error.core.validation.regexp.not_match',
        /**
         * Interpolation :
         * - `format` - The format that the value should match.
         */
        [ValueErrorType.StringFormatUnknown]: 'error.core.validation.string.format_unknown',
        /**
         * Interpolation :
         * - `format` - The format that the value should match.
         * - `value` - The value that did not match the format.
         */
        [ValueErrorType.StringFormat]: 'error.core.validation.string.format',
        /**
         * Interpolation :
         * - `max` - The maximum length allowed.
         * - `value` - The value that was longer than the maximum.
         */
        [ValueErrorType.StringMaxLength]: 'error.core.validation.string.max_length',
        /**
         * Interpolation :
         * - `min` - The minimum length allowed.
         * - `value` - The value that was shorter than the minimum.
         */
        [ValueErrorType.StringMinLength]: 'error.core.validation.string.min_length',
        /**
         * Interpolation :
         * - `pattern` - The pattern that the value should match.
         * - `value` - The value that did not match the pattern.
         */
        [ValueErrorType.StringPattern]: 'error.core.validation.string.pattern',
        /**
         * Interpolation :
         * - `type` - The type of the value.
         */
        [ValueErrorType.String]: 'error.core.validation.string.is_string',
        /**
         * Interpolation :
         * - `type` - The type of the value.
         */
        [ValueErrorType.Symbol]: 'error.core.validation.symbol.is_symbol',
        /**
         * Interpolation :
         * - `length` - The number of items in the tuple.
         */
        [ValueErrorType.TupleLength]: 'error.core.validation.tuple.length',
        /**
         * Interpolation :
         * - `type` - The type of the value.
         */
        [ValueErrorType.Tuple]: 'error.core.validation.tuple.is_tuple',
        /**
         * Interpolation :
         * - `max` - The maximum byte length allowed.
         * - `value` - The value that was longer than the maximum.
         */
        [ValueErrorType.Uint8ArrayMaxByteLength]: 'error.core.validation.uint8array.max_byte_length',
        /**
         * Interpolation :
         * - `min` - The minimum byte length allowed.
         * - `value` - The value that was shorter than the minimum.
         */
        [ValueErrorType.Uint8ArrayMinByteLength]: 'error.core.validation.uint8array.min_byte_length',
        /**
         * Interpolation :
         * - `type` - The type of the value.
         */
        [ValueErrorType.Uint8Array]: 'error.core.validation.uint8array.is_uint8array',
        /**
         * Interpolation :
         * - `type` - The type of the value.
         */
        [ValueErrorType.Undefined]: 'error.core.validation.undefined.is_undefined',
        /**
         * Interpolation :
         * - `types` - The types that the value should be one of.
         * - `type` - The type of the value.
         */
        [ValueErrorType.Union]: 'error.core.validation.union.is_union',
        /**
         * Interpolation :
         * - `type` - The type of the value.
         */
        [ValueErrorType.Void]: 'error.core.validation.void.is_void',
        [ValueErrorType.Kind]: 'error.core.validation.kind.is_kind'
    };

    /**
     * Maps registered formats to their respective error message keys.
     */
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
     * Checks if a format is registered.
     *
     * @param name - The name of the format to check.
     *
     * @returns True if the format is registered, false otherwise.
     */
    public hasFormat(name: string): boolean {
        return FormatRegistry.Has(name);
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
            return error.schema.message as string;
        if (error.errorType === ValueErrorType.StringFormat)
            return this._handleStringFormatError(error);
        return this._defaultErrorTypeAndMessage[error.errorType];
    }
}

/**
 * Singleton instance of the TypeBoxConfig class.
 */
export const TypeBoxConfig = TypeBoxConfigSingleton.instance;

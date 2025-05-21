import { CoreError } from '#/error/coreError';
import { dataErrorKeys } from './enums/dataErrorKeys';
import type { KeyTransformer } from './types/keyTransformer';

/**
 * Checks if the provided data is null or undefined and throws an error if it is.
 *
 * @template TObject - The type of the data to be validated.
 *
 * @param data - The data to be validated.
 *
 * @throws ({@link CoreError}) - Throws an error if the data is null or undefined. ({@link dataErrorKeys.dataIsNull})
 */
const _validateDataNull = <TObject>(data: TObject): void => {
    if (data === null || data === undefined)
        throw new CoreError({
            key: dataErrorKeys.dataIsNull,
            message: 'Data cannot be null or undefined.'
        });
};

/**
 * Checks if the provided data is an object and throws an error if it is not.
 *
 * @template TObject - The type of the data to be validated.
 *
 * @param data - The data to be validated.
 *
 * @throws ({@link CoreError}) - Throws an error if the data is not a plain object. ({@link dataErrorKeys.dataMustBeObject})
 */
const _validateDataIsObject = <TObject>(data: TObject): void => {
    if (typeof data !== 'object')
        throw new CoreError({
            key: dataErrorKeys.dataMustBeObject,
            message: 'Data must be a plain object.'
        });
};

/**
 * Filters the provided data by excluding the specified keys. This method will create
 * a new object that contains all properties from the original data object except for
 * those keys that are provided to be excluded. Additionally, it can also exclude
 * properties with values of null or undefined if 'excludeNullUndefined' is set to true.
 *
 * @template TObject - The type of the data object to filter, must be an object.
 *
 * @param data - The data object to be filtered.
 * @param keys - The array of keys to exclude from the data object. (Can be empty)
 * @param excludeNullUndefined - Flag to determine if properties with null or undefined values should be excluded.
 *
 * @throws ({@link CoreError}) - Throws an error if the data is null or undefined. ({@link dataErrorKeys.dataIsNull})
 * @throws ({@link CoreError}) - Throws an error if the data is not a plain object. ({@link dataErrorKeys.dataMustBeObject})
 *
 * @example
 * ```typescript
 * const object = { test: 'test', exclude: 'exclude' };
 * const filtered = filterByKeyExclusion(object, ['exclude']);
 * console.log(filtered); // { test: 'test' }
 * ```
 *
 * @example
 * ```typescript
 * const object = { test: 'test', exclude: null };
 * const filtered = filterByKeyExclusion(object, [], true);
 * console.log(filtered); // { test: 'test' }
 * ```
 *
 * @returns The filtered data object with the specified keys excluded. ({@link TObject})
 */
export const filterByKeyExclusion = <TObject extends Readonly<object>>(
    data: Readonly<TObject>,
    keys: readonly (keyof TObject)[],
    excludeNullUndefined = false
): TObject => {
    _validateDataNull(data);
    _validateDataIsObject(data);
    const filteredData = {} as TObject;
    Object.keys(data).forEach((key: string): void => {
        const typedKey = key as keyof TObject;
        if (!keys.includes(typedKey) && (!excludeNullUndefined || (data[typedKey] !== null && data[typedKey] !== undefined)))
            filteredData[typedKey] = data[typedKey];
    });
    return filteredData;
};

/**
 * Filters the provided data by including only the specified keys. The resulting object
 * will only have properties that match the keys provided. Properties with null or undefined
 * values can optionally be excluded based on the 'excludeNullUndefined' flag.
 * @template TObject - The type of the data object to filter, must be an object.
 *
 * @param data - The data object to be filtered.
 * @param keys - The array of keys to include in the resulting data object. (Can be empty)
 * @param excludeNullUndefined - Flag to determine if properties with null or undefined values should be excluded.
 *
 * @throws ({@link CoreError}) - Throws an error if the data is null or undefined. ({@link dataErrorKeys.dataIsNull})
 * @throws ({@link CoreError}) - Throws an error if the data is not a plain object. ({@link dataErrorKeys.dataMustBeObject})
 *
 * @example
 * ```typescript
 * const object = { test: 'test', exclude: 'exclude' };
 * const filtered = filterByKeyInclusion(object, ['test']);
 * console.log(filtered); // { test: 'test' }
 * ```
 *
 * @example
 * ```typescript
 * const object = { test: 'test', exclude: null };
 * const filtered = filterByKeyInclusion(object, ['test'], true);
 * console.log(filtered); // { test: 'test' }
 * ```
 *
 * @returns The filtered data object with only the specified keys included. ({@link TObject})
 */
export const filterByKeyInclusion = <TObject extends Readonly<object>>(
    data: Readonly<TObject>,
    keys: readonly (keyof TObject)[],
    excludeNullUndefined = false
): TObject => {
    _validateDataNull(data);
    _validateDataIsObject(data);
    const filteredData = {} as TObject;
    keys.forEach((key: keyof TObject): void => {
        if (key in data && (!excludeNullUndefined || (data[key] !== null && data[key] !== undefined)))
            filteredData[key] = data[key];
    });
    return filteredData;
};

/**
 * Filters the provided data based on a predicate applied to its values. The resulting object
 * will only include properties whose values satisfy the predicate function. Properties with
 * null or undefined values can be optionally excluded based on the 'excludeNullUndefined' flag.
 * @template TObject - The type of the data to be filtered, constrained to an object type.
 *
 * @param data - The data object to be filtered.
 * @param predicate - The predicate function to apply to the values.
 * @param excludeNullUndefined - Flag to determine if properties with null or undefined values should be excluded. Default is false.
 *
 * @throws ({@link CoreError}) - Throws an error if the data is null or undefined. ({@link dataErrorKeys.dataIsNull})
 * @throws ({@link CoreError}) - Throws an error if the data is not a plain object. ({@link dataErrorKeys.dataMustBeObject})
 *
 * @example
 * ```typescript
 * const object = { test: 'test', exclude: 'exclude' };
 * const filtered = filterByValue(object, (value: unknown): boolean => value === 'test');
 * console.log(filtered); // { test: 'test' }
 * ```
 *
 * @example
 * ```typescript
 * const object = { test: 'test', exclude: null };
 * const filtered = filterByValue(object, (value: unknown): boolean => value === 'test', true);
 * console.log(filtered); // { test: 'test' }
 * ```
 *
 * @returns The filtered data object with properties satisfying the predicate. ({@link TObject})
 */
export const filterByValue = <TObject extends Readonly<object>>(
    data: Readonly<TObject>,
    predicate: (value: TObject[keyof TObject]) => boolean,
    excludeNullUndefined = false
): TObject => {
    _validateDataNull(data);
    _validateDataIsObject(data);
    const filteredData = {} as TObject;
    for (const key in data)
        if (Object.hasOwn(data, key)) {
            const typedKey = key as keyof TObject;
            if (predicate(data[typedKey]) && (!excludeNullUndefined || (data[typedKey] !== null && data[typedKey] !== undefined)))
                filteredData[typedKey] = data[typedKey];
        }
    return filteredData;
};

/**
 * Transforms the keys of the given object using the current transformation strategy.
 * @template TObject - The type of the object.
 * @param data - The object whose keys are to be transformed.
 * @param transformer - The key transformation strategy to use.
 *
 * @throws ({@link CoreError}) - If the provided data object is null or undefined. ({@link dataErrorKeys.dataIsNull})
 * @throws ({@link CoreError}) - If the provided data object is not a plain object. ({@link dataErrorKeys.dataMustBeObject})
*
 * @example
 * ```typescript
 * // Return { myKey: "value" }
 * transformKeys(\{ "my-key": "value" \}, new BasaltCamelCaseTransformer());
 * ```
 *
 * @returns A new object with transformed keys. ({@link TObject})
 */
export const transformKeys= <TObject extends Readonly<object>>(
    data: Readonly<TObject>,
    transformer: Readonly<KeyTransformer>
): TObject => {
    _validateDataNull(data);
    _validateDataIsObject(data);
    const result = {} as TObject;

    for (const key in data)
        if (Object.hasOwn(data, key)) {
            const transformedKey: string = transformer.transformKey(key);
            result[transformedKey as keyof TObject] = data[key as keyof TObject];
        }
    return result;
};
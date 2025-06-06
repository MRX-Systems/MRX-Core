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
 * Filters the provided data by excluding the specified keys, with an option to exclude null or undefined values.
 * Uses a generic type parameter to control the return type based on the excludeNullUndefined flag.
 *
 * @template TObject - The type of the data object to filter, must be an object.
 * @template TExcludedKeys - The keys to exclude from the data object.
 * @template TExcludeNullUndefined - Boolean flag type to determine if properties with null or undefined values should be excluded.
 *
 * @param data - The data object to be filtered.
 * @param keys - The array of keys to exclude from the data object. (Can be empty)
 * @param excludeNullUndefined - Flag to determine if properties with null or undefined values should be excluded.
 *
 * @throws ({@link CoreError}) - Throws an error if the data is null or undefined. ({@link dataErrorKeys.dataIsNull})
 *
 * @returns The filtered data object with the specified keys excluded. ({@link TObject})
 */
export const filterByKeyExclusion = <
    TObject extends Readonly<object>,
    TExcludedKeys extends keyof TObject = never,
    TExcludeNullUndefined extends boolean = false
>(
    data: Readonly<TObject>,
    keys: readonly TExcludedKeys[],
    excludeNullUndefined?: TExcludeNullUndefined,
    throwIfDataIsNull = true
): TExcludeNullUndefined extends true
    ? Partial<Omit<TObject, TExcludedKeys>>
    : Omit<TObject, TExcludedKeys> => {
    if (throwIfDataIsNull)
        _validateDataNull(data);

    // The result object will be Partial if excludeNullUndefined is true, otherwise Omit
    const filteredData: Record<string, unknown> = {};

    Object.keys(data).forEach((key: string): void => {
        const typedKey = key as keyof TObject;
        if (
            !(keys as readonly (keyof TObject)[]).includes(typedKey)
            && (!excludeNullUndefined || (data[typedKey] !== null && data[typedKey] !== undefined))
        )
            filteredData[key] = data[typedKey];
    });

    // Type assertion is required due to conditional return type
    return filteredData as TExcludeNullUndefined extends true
        ? Partial<Omit<TObject, TExcludedKeys>>
        : Omit<TObject, TExcludedKeys>;
};

/**
 * Recursively filters the provided data by excluding the specified keys, with an option to exclude null or undefined values.
 * The keys to exclude can be any valid property key and will be applied recursively to all nested objects.
 *
 * @template TObject - The type of the data object to filter, must be an object.
 * @template TExcludedKeys - The keys to exclude from the data object and all nested objects.
 *
 * @param data - The data object to be filtered.
 * @param keys - The array of keys to exclude from the data object and all nested objects. (Can be empty)
 * @param excludeNullUndefined - Flag to determine if properties with null or undefined values should be excluded. Default is false.
 * @param throwIfDataIsNull - Flag to determine if an error should be thrown when data is null or undefined. Default is true.
 *
 * @throws ({@link CoreError}) - Throws an error if the data is null or undefined and throwIfDataIsNull is true. ({@link dataErrorKeys.dataIsNull})
 *
 * @returns A new object with the specified keys excluded recursively.
 */
export const filterByKeyExclusionRecursive = <
    TObject extends Readonly<object>,
    TExcludedKeys extends PropertyKey = never
>(
    data: Readonly<TObject>,
    keys: readonly TExcludedKeys[],
    excludeNullUndefined = false,
    throwIfDataIsNull = true
): Record<string, unknown> => {
    if (throwIfDataIsNull)
        _validateDataNull(data);

    const filteredData: Record<string, unknown> = {};

    for (const key in data) {
        const typedKey = key as keyof TObject;
        if (
            !(keys as readonly PropertyKey[]).includes(typedKey as PropertyKey)
            && (!excludeNullUndefined || (data[typedKey] !== null && data[typedKey] !== undefined))
        )
            if (typeof data[typedKey] === 'object' && data[typedKey] !== null && !Array.isArray(data[typedKey]))
                filteredData[key] = filterByKeyExclusionRecursive<Readonly<object>, TExcludedKeys>(
                    data[typedKey] as Readonly<object>,
                    keys,
                    excludeNullUndefined,
                    false
                );
            else if (Array.isArray(data[typedKey]))
                filteredData[key] = (data[typedKey] as unknown[]).map((item) => {
                    if (typeof item === 'object' && item !== null && !Array.isArray(item))
                        return filterByKeyExclusionRecursive<Readonly<object>, TExcludedKeys>(
                            item,
                            keys,
                            excludeNullUndefined,
                            false
                        );
                    return item;
                });
            else
                filteredData[key] = data[typedKey];
    }

    return filteredData;
};

/**
 * Filters the provided data by including only the specified keys, with an option to exclude null or undefined values.
 * Uses a generic type parameter to control the return type based on the excludeNullUndefined flag.
 *
 * @template TObject - The type of the data object to filter, must be an object.
 * @template TIncludedKeys - The keys to include from the data object.
 * @template TExcludeNullUndefined - Boolean flag type to determine if properties with null or undefined values should be excluded.
 *
 * @param data - The data object to be filtered.
 * @param keys - The array of keys to include in the resulting data object. (Can be empty)
 * @param excludeNullUndefined - Flag to determine if properties with null or undefined values should be excluded.
 *
 * @throws ({@link CoreError}) - Throws an error if the data is null or undefined. ({@link dataErrorKeys.dataIsNull})
 *
 * @example
 * ```ts
 * const object = { test: 'test', exclude: 'exclude' };
 * const filtered = filterByKeyInclusion(object, ['test']);
 * console.log(filtered); // { test: 'test' }
 * ```
 *
 * @example
 * ```ts
 * const object = { test: 'test', exclude: null };
 * const filtered = filterByKeyInclusion(object, ['test'], true);
 * console.log(filtered); // { test: 'test' }
 * ```
 *
 * @returns The filtered data object with only the specified keys included. ({@link TObject})
 */
export const filterByKeyInclusion = <
    TObject extends Readonly<object>,
    TIncludedKeys extends keyof TObject = never,
    TExcludeNullUndefined extends boolean = false
>(
    data: Readonly<TObject>,
    keys: readonly TIncludedKeys[],
    excludeNullUndefined?: TExcludeNullUndefined,
    throwIfDataIsNull = true
): TExcludeNullUndefined extends true
    ? Partial<Pick<TObject, TIncludedKeys>>
    : Pick<TObject, TIncludedKeys> => {
    if (throwIfDataIsNull)
        _validateDataNull(data);

    // The result object will be Partial if excludeNullUndefined is true, otherwise Pick
    const filteredData: Record<string, unknown> = {};

    (keys as readonly (keyof TObject)[]).forEach((key: keyof TObject): void => {
        if (
            key in data
            && (!excludeNullUndefined || (data[key] !== null && data[key] !== undefined))
        )
            filteredData[key as string] = data[key];
    });

    // Type assertion is required due to conditional return type
    return filteredData as TExcludeNullUndefined extends true
        ? Partial<Pick<TObject, TIncludedKeys>>
        : Pick<TObject, TIncludedKeys>;
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
 *
 * @example
 * ```ts
 * const object = { test: 'test', exclude: 'exclude' };
 * const filtered = filterByValue(object, (value: unknown): boolean => value === 'test');
 * console.log(filtered); // { test: 'test' }
 * ```
 *
 * @example
 * ```ts
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
    excludeNullUndefined = false,
    throwIfDataIsNull = true
): TObject => {
    if (throwIfDataIsNull)
        _validateDataNull(data);
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
 * ```ts
 * // Return { myKey: "value" }
 * transformKeys(\{ "my-key": "value" \}, new BasaltCamelCaseTransformer());
 * ```
 *
 * @returns A new object with transformed keys. ({@link TObject})
 */
export const transformKeys= <TObject extends Readonly<object>>(
    data: Readonly<TObject>,
    transformer: Readonly<KeyTransformer>,
    throwIfDataIsNull = true
): TObject => {
    if (throwIfDataIsNull)
        _validateDataNull(data);
    const result = {} as TObject;

    for (const key in data)
        if (Object.hasOwn(data, key)) {
            const transformedKey: string = transformer.transformKey(key);
            result[transformedKey as keyof TObject] = data[key as keyof TObject];
        }
    return result;
};
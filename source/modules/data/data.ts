import { BaseError } from '#/errors/base-error';
import { DATA_ERROR_KEYS } from './enums/data-error-keys';
import type { CaseTransformer } from './types/case-transformer';
import type { TransformObjectKeys } from './types/transform-object-keys';

/**
 * Checks if the provided data is null or undefined and throws an error if it is.
 *
 * @template TObject - The type of the data to be validated. Must be an object.
 *
 * @param data - The data to be validated.
 *
 * @throws ({@link BaseError}) - Throws an error if the data is null or undefined.
 */
const _validateDataNull = <TObject extends object>(data: TObject): void => {
	if (data === null || data === undefined)
		throw new BaseError(DATA_ERROR_KEYS.DATA_IS_NULL);
};

/**
 * Filters the provided data by excluding the specified keys.
 *
 * @template TObject - The type of the data object to filter, must be an object.
 * @template TExcludedKeys - The keys to exclude from the data object.
 * @template TExcludeNullUndefined - Boolean flag type to determine if properties with null or undefined values should be excluded.
 *
 * @param data - The data object to be filtered.
 * @param keys - The array of keys to exclude from the data object. (Can be empty)
 * @param excludeNullUndefined - Flag to determine if properties with null or undefined values should be excluded.
 *
 * @throws ({@link BaseError}) - Throws an error if the data is null or undefined.
 *
 * @returns The filtered data object with the specified keys excluded.
 *
 * @example
 * Excludes the specified keys from the data object and returns a new object with the remaining properties.
 * ```ts
 * const object = { test: 'test', exclude: 'exclude' }; // type is { test: string, exclude: string }
 * const filtered = filterByKeyExclusion(object, ['exclude']); // new type is { test: string }
 * ```
 * @example
 * Excludes the specified keys from the data object and returns a new object with the remaining properties, excluding null or undefined values.
 * ```ts
 * const object = { test: 'test', exclude: 'exclude', nullValue: null, undefinedValue: undefined }; // type is { test: string, exclude: string, nullValue: null, undefinedValue: undefined }
 * const filtered = filterByKeyExclusion(object, ['exclude'], true); // new type is { test: string }
 * ```
 */
export const filterByKeyExclusion = <
	TObject extends Readonly<object>,
	TExcludedKeys extends keyof TObject = never,
	TExcludeNullUndefined extends boolean = false
>(
	data: Readonly<TObject>,
	keys: readonly TExcludedKeys[],
	excludeNullUndefined?: TExcludeNullUndefined
): TExcludeNullUndefined extends true
	? Partial<Omit<TObject, TExcludedKeys>>
	: Omit<TObject, TExcludedKeys> => {
	_validateDataNull(data);
	const filteredData: Record<string, unknown> = {};

	for (const key in data) {
		const typedKey = key as keyof TObject;
		if (
			!(keys as readonly PropertyKey[]).includes(typedKey as PropertyKey)
			&& (!excludeNullUndefined || (data[typedKey] !== null && data[typedKey] !== undefined))
		)
			filteredData[key] = data[typedKey];
	}

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
 *
 * @throws ({@link BaseError}) - Throws an error if the data is null or undefined and throwIfDataIsNull is true.
 *
 * @returns A new object with the specified keys excluded recursively.
 *
 * @example
 * ```typescript
 * const object = { test: 'test', nested: { exclude: 'exclude', value: 'value' } };
 * const filtered = filterByKeyExclusionRecursive(object, ['exclude']); // new type is { test: string, nested: { value: string } } (add third parameter to exclude null/undefined values)
 * ```
 */
export const filterByKeyExclusionRecursive = <
	TObject extends Readonly<object>,
	TExcludedKeys extends PropertyKey = never
>(
	data: Readonly<TObject>,
	keys: readonly TExcludedKeys[],
	excludeNullUndefined = false
): Record<string, unknown> => {
	_validateDataNull(data);

	const filteredData: Record<PropertyKey, unknown> = {};

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
					excludeNullUndefined
				);
			else if (Array.isArray(data[typedKey]))
				filteredData[key] = (data[typedKey] as unknown[]).map((item) => {
					if (typeof item === 'object' && item !== null && !Array.isArray(item))
						return filterByKeyExclusionRecursive<Readonly<object>, TExcludedKeys>(
							item,
							keys,
							excludeNullUndefined
						);
					return item;
				});
			else
				filteredData[key] = data[typedKey];
	}

	for (const symbol of Object.getOwnPropertySymbols(data))
		filteredData[symbol] = (data as Record<symbol, unknown>)[symbol];

	return filteredData;
};

/**
 * Filters the provided data by including only the specified keys, with an option to exclude null or undefined values.
 *
 * @template TObject - The type of the data object to filter, must be an object.
 * @template TIncludedKeys - The keys to include from the data object.
 * @template TExcludeNullUndefined - Boolean flag type to determine if properties with null or undefined values should be excluded.
 *
 * @param data - The data object to be filtered.
 * @param keys - The array of keys to include in the resulting data object. (Can be empty)
 * @param excludeNullUndefined - Flag to determine if properties with null or undefined values should be excluded.
 *
 * @throws ({@link BaseError}) - Throws an error if the data is null or undefined.
 *
 * @returns The filtered data object with only the specified keys included.
 *
 * @example
 * ```typescript
 * const object = { test: 'test', exclude: 'exclude' }; // type is { test: string, exclude: string }
 * const filtered = filterByKeyInclusion(object, ['test']); // new type is { test: string } (add third parameter to exclude null/undefined values)
 * ```
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

	const filteredData: Record<string, unknown> = {};

	for (const key of keys) {
		const typedKey = key as keyof TObject;
		if (
			typedKey in data
			&& (!excludeNullUndefined || (data[typedKey] !== null && data[typedKey] !== undefined))
		)
			filteredData[key as string] = data[typedKey];
	}

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
 * @throws ({@link BaseError}) - Throws an error if the data is null or undefined.
 *
 * @returns The filtered data object with properties satisfying the predicate.
 *
 * @example
 * ```ts
 * const object = { test: 'test', exclude: 'exclude' };
 * const filtered = filterByValue(object, (value: unknown): boolean => value === 'test'); // you can also add third parameter to exclude null/undefined values
 * ```
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
 *
 * @template TObject - The type of the object.
 * @template TTransformer - The type of the key transformation strategy.
 *
 * @param data - The object whose keys are to be transformed.
 * @param transformer - The key transformation strategy to use.
 *
 * @throws ({@link BaseError}) - If the provided data object is null or undefined.
 *
 * @returns A new object with transformed keys.
 *
 * @example
 * ```ts
 * transformKeys({ "my-key": "value" }, new CamelCaseTransformer()); // Returns { myKey: "value" }
 * ```
 */
export const transformKeys = <
	TObject extends Readonly<Record<string, unknown>>,
	TTransformer extends CaseTransformer
>(
	data: Readonly<TObject>,
	transformer: Readonly<TTransformer>,
	throwIfDataIsNull = true
): TransformObjectKeys<TObject, TTransformer> => {
	if (throwIfDataIsNull)
		_validateDataNull(data);

	const result = {} as Record<string, TObject[keyof TObject]>;

	for (const key in data) {
		const transformedKey = transformer.convertCase(key);
		result[transformedKey] = data[key];
	}

	return result as TransformObjectKeys<TObject, TTransformer>;
};
/**
 * Adds a specified prefix to all keys in an object type.
 *
 * @template T - The original object type extending object
 * @template Prefix - The prefix to add to each key
 */
export type AddPrefixToAllKeys<T extends object, Prefix extends string> = {
	[K in keyof T as K extends string ? `${Prefix}${K}` : never]: T[K]
};
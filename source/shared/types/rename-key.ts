/**
 * Renames a key in an object type while preserving all other properties.
 *
 * @template T - The original object type extending object
 * @template From - The key to rename (must exist in T)
 * @template To - The new key name
*/
export type RenameKey<T extends object, From extends keyof T, To extends PropertyKey> = {
	[K in keyof T as K extends From ? To : K]: T[K]
};
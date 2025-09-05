import type { KebabCase } from './kebab-case';

export type TransformKeysKebabCase<T> = {
	[K in keyof T as KebabCase<Extract<K, string>>]: T[K];
};
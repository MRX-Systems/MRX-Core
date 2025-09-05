import type { CamelCase } from './camel-case';

export type TransformKeysCamelCase<T> = {
	[K in keyof T as CamelCase<Extract<K, string>>]: T[K];
};
import type { SnakeCase } from './snake-case';

export type TransformKeysSnakeCase<T> = {
	[K in keyof T as SnakeCase<Extract<K, string>>]: T[K];
};
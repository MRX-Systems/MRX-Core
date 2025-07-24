import type { SnakeCase } from './snakeCase';

export type TransformKeysSnakeCase<T> = {
	[K in keyof T as SnakeCase<Extract<K, string>>]: T[K];
};
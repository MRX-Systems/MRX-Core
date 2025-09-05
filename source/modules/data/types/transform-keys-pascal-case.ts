import type { PascalCase } from './pascal-case';

export type TransformKeysPascalCase<T> = {
	[K in keyof T as PascalCase<Extract<K, string>>]: T[K];
};
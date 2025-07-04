import type { PascalCase } from './pascalCase';

export type TransformKeysPascalCase<T> = {
	[K in keyof T as PascalCase<Extract<K, string>>]: T[K];
};
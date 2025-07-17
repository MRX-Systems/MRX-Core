import type { KebabCase } from './kebabCase';

export type TransformKeysKebabCase<T> = {
    [K in keyof T as KebabCase<Extract<K, string>>]: T[K];
};
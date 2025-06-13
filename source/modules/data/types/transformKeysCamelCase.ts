import type { CamelCase } from './camelCase';

export type TransformKeysCamelCase<T> = {
    [K in keyof T as CamelCase<Extract<K, string>>]: T[K];
};
import type { CamelCase } from './camelCase';

export type PascalCase<S extends string> =
    S extends `${infer First}${infer Rest}`
        ? `${Uppercase<First>}${CamelCase<Rest>}`
        : S;
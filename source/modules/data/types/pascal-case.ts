import type { CamelCase } from './camel-case';

export type PascalCase<S extends string>
= S extends `${infer First}${infer Rest}`
	? `${Uppercase<First>}${CamelCase<Rest>}`
	: S;
export type KebabCase<S extends string>
	= S extends `${infer First}${infer Rest}`
		? First extends Uppercase<First>
			? `-${Lowercase<First>}${KebabCase<Rest>}`
			: `${First}${KebabCase<Rest>}`
		: S;

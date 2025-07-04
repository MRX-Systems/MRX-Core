export type CamelCase<S extends string>
= S extends `${infer First}${infer Rest}`
	? First extends Uppercase<First>
		? `${Lowercase<First>}${CamelCase<Rest>}`
		: S extends `${infer P1}_${infer P2}${infer P3}`
			? `${P1}${Uppercase<P2>}${CamelCase<P3>}`
			: S extends `${infer P1}-${infer P2}${infer P3}`
				? `${P1}${Uppercase<P2>}${CamelCase<P3>}`
				: S
	: S;
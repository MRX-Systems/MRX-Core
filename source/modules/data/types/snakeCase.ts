export type SnakeCase<S extends string>
= S extends `${infer Head}${infer Tail}`
	? Head extends Lowercase<Head>
		? Tail extends ''
			? Head
			: `${Head}${SnakeCase<Tail>}`
		: `_${Lowercase<Head>}${SnakeCase<Tail>}`
	: S;
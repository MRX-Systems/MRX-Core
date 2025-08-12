export type RenameKey<T, From extends keyof T, To extends PropertyKey> = {
	[K in keyof T as K extends From ? To : K]: T[K]
};
import type {
	TArray,
	TBoolean,
	TDate,
	TInteger,
	TNull,
	TNumber,
	TObject,
	TPartial,
	TSchema,
	TString,
	TTuple,
	TUnion
} from '@sinclair/typebox/type';

type ResolvedSchema<T extends TSchema> = T extends TUnion<infer U extends TSchema[]>
	? U extends [infer First, ...infer Rest extends TSchema[]]
		? First extends TNull
			? Rest extends TSchema[]
				? ResolvedSchema<TUnion<Rest>>
				: T
			: First
		: T
	: T;

type SafeResolvedSchema<T extends TSchema> = ResolvedSchema<T> extends infer R extends TSchema
	? R
	: never;

export type AdaptiveWhereClauseSchema<TFieldSchema extends TSchema> = SafeResolvedSchema<TFieldSchema> extends TString
	? TPartial<TObject<{
		$eq: SafeResolvedSchema<TFieldSchema>;
		$neq: SafeResolvedSchema<TFieldSchema>;
		$isNull: TBoolean;
	} & {
		$in: TArray<SafeResolvedSchema<TFieldSchema>>;
		$nin: TArray<SafeResolvedSchema<TFieldSchema>>;
		$like: TString;
		$nlike: TString;
	}>>
	: SafeResolvedSchema<TFieldSchema> extends TNumber | TDate | TInteger
		? TPartial<TObject<{
			$eq: SafeResolvedSchema<TFieldSchema>;
			$neq: SafeResolvedSchema<TFieldSchema>;
			$isNull: TBoolean;
		} & {
			$in: TArray<SafeResolvedSchema<TFieldSchema>>;
			$nin: TArray<SafeResolvedSchema<TFieldSchema>>;
			$like: TString;
			$nlike: TString;
		} & {
			$lt: SafeResolvedSchema<TFieldSchema>;
			$lte: SafeResolvedSchema<TFieldSchema>;
			$gt: SafeResolvedSchema<TFieldSchema>;
			$gte: SafeResolvedSchema<TFieldSchema>;
			$between: TTuple<[SafeResolvedSchema<TFieldSchema>, SafeResolvedSchema<TFieldSchema>]>;
			$nbetween: TTuple<[SafeResolvedSchema<TFieldSchema>, SafeResolvedSchema<TFieldSchema>]>;
		}>>
		: TPartial<TObject<{
			$eq: SafeResolvedSchema<TFieldSchema>;
			$neq: SafeResolvedSchema<TFieldSchema>;
			$isNull: TBoolean;
		}>>;
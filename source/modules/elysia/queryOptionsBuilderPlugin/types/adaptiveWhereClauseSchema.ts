import type {
	TArray,
	TBoolean,
	TDate,
	TInteger,
	TNumber,
	TObject,
	TPartial,
	TSchema,
	TString,
	TTuple
} from '@sinclair/typebox';

export type AdaptiveWhereClauseSchema<TValue extends TSchema> = TPartial<(
	TValue extends TString
		? TObject<{
			$eq: TValue;
			$neq: TValue;
			$isNull: TBoolean;
		} & {
			$in: TArray<TValue>;
			$nin: TArray<TValue>;
			$like: TString;
			$nlike: TString;
		}>
		: TValue extends TNumber | TDate | TInteger
			? TObject<{
				$eq: TValue;
				$neq: TValue;
				$isNull: TBoolean;
			} & {
				$in: TArray<TValue>;
				$nin: TArray<TValue>;
				$like: TString;
				$nlike: TString;
			} & {
				$lt: TValue;
				$lte: TValue;
				$gt: TValue;
				$gte: TValue;
				$between: TTuple<[TValue, TValue]>;
				$nbetween: TTuple<[TValue, TValue]>;
			}>
			: TObject<{
				$eq: TBoolean;
				$neq: TBoolean;
				$isNull: TBoolean;
			}>
)>;
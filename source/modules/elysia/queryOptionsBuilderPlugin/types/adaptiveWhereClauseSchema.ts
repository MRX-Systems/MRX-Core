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

export type AdaptiveWhereClauseSchema<TFieldSchema extends TSchema> = TPartial<(
	TFieldSchema extends TString
		? TObject<{
			$eq: TFieldSchema;
			$neq: TFieldSchema;
			$isNull: TBoolean;
		} & {
			$in: TArray<TFieldSchema>;
			$nin: TArray<TFieldSchema>;
			$like: TString;
			$nlike: TString;
		}>
		: TFieldSchema extends TNumber | TDate | TInteger
			? TObject<{
				$eq: TFieldSchema;
				$neq: TFieldSchema;
				$isNull: TBoolean;
			} & {
				$in: TArray<TFieldSchema>;
				$nin: TArray<TFieldSchema>;
				$like: TString;
				$nlike: TString;
			} & {
				$lt: TFieldSchema;
				$lte: TFieldSchema;
				$gt: TFieldSchema;
				$gte: TFieldSchema;
				$between: TTuple<[TFieldSchema, TFieldSchema]>;
				$nbetween: TTuple<[TFieldSchema, TFieldSchema]>;
			}>
			: TObject<{
				$eq: TBoolean;
				$neq: TBoolean;
				$isNull: TBoolean;
			}>
)>;
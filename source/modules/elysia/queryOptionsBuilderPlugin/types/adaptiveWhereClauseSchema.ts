import type {
    TArray,
    TBoolean,
    TDate,
    TInteger,
    TNumber,
    TObject,
    TOptional,
    TSchema,
    TString,
    TTuple
} from '@sinclair/typebox';

export type AdaptiveWhereClauseSchema<TValue extends TSchema> =
    TValue extends TString
        ? TObject<{
            $eq: TOptional<TValue>;
            $neq: TOptional<TValue>;
            $isNull: TOptional<TBoolean>;
        } & {
            $in: TOptional<TArray<TValue>>;
            $nin: TOptional<TArray<TValue>>;
            $like: TOptional<TString>;
            $nlike: TOptional<TString>;
        }>
        : TValue extends TNumber | TDate | TInteger
            ? TObject<{
                $eq: TOptional<TValue>;
                $neq: TOptional<TValue>;
                $isNull: TOptional<TBoolean>;
            } & {
                $in: TOptional<TArray<TValue>>;
                $nin: TOptional<TArray<TValue>>;
                $like: TOptional<TString>;
                $nlike: TOptional<TString>;
            } & {
                $lt: TOptional<TValue>;
                $lte: TOptional<TValue>;
                $gt: TOptional<TValue>;
                $gte: TOptional<TValue>;
                $between: TOptional<TTuple<[TValue, TValue]>>;
                $nbetween: TOptional<TTuple<[TValue, TValue]>>;
            }>
            : TObject<{
                $eq: TOptional<TValue>;
                $neq: TOptional<TValue>;
                $isNull: TOptional<TBoolean>;
            }>;
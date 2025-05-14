export interface WhereClause<TValue> {
    $eq: TValue;
    $neq: TValue;
    $lt: TValue;
    $lte: TValue;
    $gt: TValue;
    $gte: TValue;
    $in: TValue[];
    $nin: TValue[];
    $between: [TValue, TValue];
    $nbetween: [TValue, TValue];
    $like: string;
    $nlike: string;
    $isNull: boolean;
}
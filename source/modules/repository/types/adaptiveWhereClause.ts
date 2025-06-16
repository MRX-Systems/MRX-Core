export type AdaptiveWhereClause<TValue> = TValue extends string
    ? {
        $eq?: TValue;
        $neq?: TValue;
        $isNull?: boolean;
    } & {
        $in?: TValue[];
        $nin?: TValue[];
        $like?: string;
        $nlike?: string;
    }
    : TValue extends number | Date | bigint ? {
        $eq?: TValue;
        $neq?: TValue;
        $isNull?: boolean;
    } & {
        $in?: TValue[];
        $nin?: TValue[];
        $like?: string;
        $nlike?: string;
    } & {
        $lt?: TValue;
        $lte?: TValue;
        $gt?: TValue;
        $gte?: TValue;
        $between?: [TValue, TValue];
        $nbetween?: [TValue, TValue];
    }
        : {
            $eq?: TValue;
            $neq?: TValue;
            $isNull?: boolean;
        };

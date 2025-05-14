interface WhereClause<TValue> {
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


export type SelectedFields<TModel> = (keyof TModel extends string ? keyof TModel : never)[] | string[];

export type AdvancedSearch<TModel> = {
    $q?: string | number | {
        selectedFields: SelectedFields<TModel>,
        value: string | number
    };
} & {
    [Key in keyof TModel]?: TModel[Key] | Partial<WhereClause<TModel[Key]>>;
};

interface User {
    id: number;
    name: string;
}

const search: AdvancedSearch<User>[] = [
    {
        id: {
            $eq: 2
        }
    }
];
import { S } from '#/common/lib/required/fluent-json-schema/fluent.lib.ts';

export const WhereClauseSchema = S.object()
    .prop('$in', S.array())
    .prop('$nin', S.array())
    .prop('$eq')
    .prop('$neq')
    .prop('$match', S.string())
    .prop('$lt')
    .prop('$lte')
    .prop('$gt')
    .prop('$gte')
    .prop('$isNull')
    .prop('$isNotNull');

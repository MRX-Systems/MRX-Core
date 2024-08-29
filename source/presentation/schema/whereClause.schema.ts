import { S } from 'fluent-json-schema';

export const WhereClauseSchema = S.object()
    .prop('$in', S.array().items(S.oneOf([S.string(), S.number()])))
    .prop('$nin', S.array().items(S.oneOf([S.string(), S.number()])))
    .prop('$eq', S.oneOf([S.string(), S.number(), S.boolean()]))
    .prop('$neq', S.oneOf([S.string(), S.number(), S.boolean()]))
    .prop('$match', S.string())
    .prop('$lt', S.oneOf([S.string(), S.number()]))
    .prop('$lte', S.oneOf([S.string(), S.number()]))
    .prop('$gt', S.oneOf([S.string(), S.number()]))
    .prop('$gte', S.oneOf([S.string(), S.number()]));

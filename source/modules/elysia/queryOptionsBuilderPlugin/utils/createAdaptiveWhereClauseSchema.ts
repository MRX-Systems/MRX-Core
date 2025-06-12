import {
    TypeGuard,
    type TSchema
} from '@sinclair/typebox';
import { t } from 'elysia';

import type { AdaptiveWhereClauseSchema } from '#/modules/elysia/queryOptionsBuilderPlugin/types/adaptiveWhereClauseSchema';

/**
 * Creates a where clause schema with appropriate operators based on the property type.
 * Boolean properties get fewer operators than other types.
 *
 * @template TInferedSchema - The TypeBox schema to create where clauses for. Extends {@link TSchema}
 *
 * @param schema - The base property schema to create where clauses for. {@link TInferedSchema}
 *
 * @returns A TypeBox object schema with where clause operators
 */
export const createAdaptiveWhereClauseSchema = <TInferedSchema extends TSchema>(schema: TInferedSchema) => {
    // all
    const common = {
        $eq: schema,
        $neq: schema,
        $isNull: t.Boolean()
    } as const;

    // string, number, date
    const strNumDate = (TypeGuard.IsString(schema)
        || TypeGuard.IsNumber(schema)
        || TypeGuard.IsInteger(schema)
        || TypeGuard.IsDate(schema))
        ? {
            $in: t.Array(schema, { minItems: 1, uniqueItems: true }),
            $nin: t.Array(schema, { minItems: 1, uniqueItems: true }),
            $like: t.String(),
            $nlike: t.String()
        } as const
        : {};

    // number, date
    const numDate = (TypeGuard.IsNumber(schema)
        || TypeGuard.IsInteger(schema)
        || TypeGuard.IsDate(schema))
        ? {
            $lt: schema,
            $lte: schema,
            $gt: schema,
            $gte: schema,
            $between: t.Tuple([schema, schema]),
            $nbetween: t.Tuple([schema, schema])
        } as const
        : {};

    return t.Partial(t.Object({ ...common, ...strNumDate, ...numDate })) as unknown as AdaptiveWhereClauseSchema<TInferedSchema>;
};
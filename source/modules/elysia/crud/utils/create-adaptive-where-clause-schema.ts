import { KindGuard, type TSchema } from '@sinclair/typebox/type';
import { t } from 'elysia';

import type { AdaptiveWhereClauseSchema } from '#/modules/elysia/crud/types/adaptive-where-clause-schema';
import { isDateFromElysiaTypeBox } from './is-date-from-elysia-typebox';

/**
 * Creates an adaptive where clause schema with appropriate operators based on the field type.
 *
 * Generates different sets of query operators depending on the schema type:
 * - All types: $eq, $neq, $isNull
 * - String/Number/Date types: additional $in, $nin, $like, $nlike operators
 * - Number/Date types: additional comparison operators ($lt, $lte, $gt, $gte, $between, $nbetween)
 *
 * @template TFieldSchema - The TypeBox schema type to create where clauses for
 *
 * @param schema - The base field schema to generate where clause operators for
 *
 * @returns An adaptive where clause schema with operators appropriate for the field type
 */
export const createAdaptiveWhereClauseSchema = <
	const TFieldSchema extends TSchema
>(schema: TFieldSchema): AdaptiveWhereClauseSchema<TFieldSchema> => {
	// all
	const common = {
		$eq: schema,
		$neq: schema,
		$isNull: t.Boolean()
	} as const;

	// string, number, date
	const strNumDate = (KindGuard.IsString(schema)
		|| KindGuard.IsNumber(schema)
		|| isDateFromElysiaTypeBox(schema))
		? {
			$in: t.Array(schema, { minItems: 1, uniqueItems: true }),
			$nin: t.Array(schema, { minItems: 1, uniqueItems: true }),
			$like: t.String(),
			$nlike: t.String()
		} as const
		: {};

	// number, date
	const numDate = (KindGuard.IsNumber(schema)
		|| isDateFromElysiaTypeBox(schema))
		? {
			$lt: schema,
			$lte: schema,
			$gt: schema,
			$gte: schema,
			$between: t.Tuple([schema, schema]),
			$nbetween: t.Tuple([schema, schema])
		} as const
		: {};

	return t.Partial(t.Object({ ...common, ...strNumDate, ...numDate })) as unknown as AdaptiveWhereClauseSchema<TFieldSchema>;
};
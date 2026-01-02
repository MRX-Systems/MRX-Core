import { KindGuard, type TSchema } from '@sinclair/typebox/type';
import { t } from 'elysia';

import type { AdaptiveWhereClauseSchema } from './types/adaptive-where-clause-schema';
import { isDateFromElysiaTypeBox } from './utils/is-date-from-elysia-typebox';

/**
 * Build an AdaptiveWhereClauseSchema with appropriate operators based on the field type
 *
 * Generates different sets of query operators depending on the schema type:
 * - All types: $eq, $neq, $isNull
 * - String/Number/Date types: additional $in, $nin, $like, $nlike operators
 * - Number/Date types: additional comparison operators ($lt, $lte, $gt, $gte, $between, $nbetween)
 *
 * @template TFieldSchema - The source object schema type.
 *
 * @param schema - The field schema to build the AdaptiveWhereClauseSchema for
 *
 * @returns An AdaptiveWhereClauseSchema
 */
export const buildAdaptiveWhereClauseSchema = <
	const TFieldSchema extends TSchema
>(schema: TFieldSchema): AdaptiveWhereClauseSchema<TFieldSchema> => {
	// all
	const common = {
		$eq: schema,
		$neq: schema,
		$isNull: t.Boolean()
	} as const;

	const isDateElysiaTypeBox = isDateFromElysiaTypeBox(schema);

	if (KindGuard.IsUnion(schema) && !isDateElysiaTypeBox)
		[schema] = schema.anyOf.filter((s) => !KindGuard.IsNull(s)) as [TFieldSchema];

	// string, number, date
	const strNumDate = (
		KindGuard.IsString(schema)
		|| KindGuard.IsNumber(schema)
		|| isDateElysiaTypeBox
		|| KindGuard.IsDate(schema)
	)
		? {
			$in: t.Array(schema, { minItems: 1, uniqueItems: true }),
			$nin: t.Array(schema, { minItems: 1, uniqueItems: true }),
			$like: t.String(),
			$nlike: t.String()
		} as const
		: {};

	// number, date
	const numDate = (
		KindGuard.IsNumber(schema)
		|| isDateElysiaTypeBox
		|| KindGuard.IsDate(schema)
	)
		? {
			$lt: schema,
			$lte: schema,
			$gt: schema,
			$gte: schema,
			$between: t.Tuple([schema, schema]),
			$nbetween: t.Tuple([schema, schema])
		} as const
		: {};

	return t.Partial(t.Object({
		...common,
		...strNumDate,
		...numDate
	})) as unknown as AdaptiveWhereClauseSchema<TFieldSchema>;
};
import {
	TypeGuard,
	type TSchema
} from '@sinclair/typebox';
import { t } from 'elysia';

import type { AdaptiveWhereClauseSchema } from '#/modules/elysia/queryOptionsBuilderPlugin/types/adaptiveWhereClauseSchema';
import { isDateFromElysiaTypeBox } from './isDateFromElysiaTypeBox';

/**
 * Creates a where clause schema with appropriate operators based on the property type.
 * Boolean properties get fewer operators than other types.
 *
 * @template TFieldSchema - The TypeBox schema to create where clauses for. Extends {@link TSchema}
 *
 * @param schema - The base property schema to create where clauses for. {@link TFieldSchema}
 *
 * @returns A TypeBox object schema with where clause operators
 */
export const createAdaptiveWhereClauseSchema = <TFieldSchema extends TSchema>(schema: TFieldSchema): AdaptiveWhereClauseSchema<TFieldSchema> => {
	// all
	const common = {
		$eq: schema,
		$neq: schema,
		$isNull: t.Boolean()
	} as const;

	// string, number, date
	const strNumDate = (TypeGuard.IsString(schema)
		|| TypeGuard.IsNumber(schema)
		|| isDateFromElysiaTypeBox(schema))
		? {
			$in: t.Array(schema, { minItems: 1, uniqueItems: true }),
			$nin: t.Array(schema, { minItems: 1, uniqueItems: true }),
			$like: t.String(),
			$nlike: t.String()
		} as const
		: {};

	// number, date
	const numDate = (TypeGuard.IsNumber(schema)
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
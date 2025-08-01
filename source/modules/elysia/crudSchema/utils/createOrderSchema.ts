import type { TObject } from '@sinclair/typebox';
import { t } from 'elysia/type-system';

import type { OrderSchema } from '#/modules/elysia/crudSchema/types/orderSchema';

/**
 * Creates order schema for query options.
 *
 * @template TSourceSchema - The TypeBox object schema to create order by for. Extends {@link TObject}
 *
 * @param schema - The base object schema to create order by for. {@link TSourceSchema}
 *
 * @returns A tuple schema with field name and direction
 */
export const createOrderSchema = <TSourceSchema extends TObject>(schema: TSourceSchema): OrderSchema<TSourceSchema> => t.Union([
	t.Object({
		selectedField: t.KeyOf(schema),
		direction: t.Union([t.Literal('asc'), t.Literal('desc')])
	}),
	t.Array(t.Object({
		selectedField: t.KeyOf(schema),
		direction: t.Union([t.Literal('asc'), t.Literal('desc')])
	}), {
		minItems: 1,
		uniqueItems: true
	})
]);
import type { TObject } from '@sinclair/typebox/type';
import { t } from 'elysia/type-system';

import type { OrderBySchema } from './types/order-by-schema';

/**
 * Build a OrderBySchema for the given source object schema.
 *
 * @template TSourceSchema - The source object schema type.
 *
 * @param schema - The source object schema to build the OrderBy schema for
 *
 * @returns A OrderBySchema for the given source object schema
 */
export const buildOrderBySchema = <const TSourceSchema extends TObject>(schema: TSourceSchema): OrderBySchema<TSourceSchema> => t.Object({
	selectedField: t.KeyOf(schema),
	direction: t.Union([t.Literal('asc'), t.Literal('desc')])
});
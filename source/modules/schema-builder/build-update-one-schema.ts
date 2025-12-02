import type { TObject } from '@sinclair/typebox/type';
import { t } from 'elysia';

import type { UpdateOneSchema } from './types/update-one-schema';

/**
 * Builds a UpdateOneSchema.
 *
 * @template TSourceUpdateSchema - The source object schema to build the update schema from.
 *
 * @param schema - The source object schema to build the update schema from.
 *
 * @returns A TypeBox object schema for updating a single record.
 */
export const buildUpdateOneSchema = <TSourceUpdateSchema extends TObject>(schema: TSourceUpdateSchema): UpdateOneSchema<TSourceUpdateSchema> => t.Object({
	data: t.Partial(schema)
});
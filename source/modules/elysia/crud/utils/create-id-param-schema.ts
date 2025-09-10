import { t } from 'elysia';

import type { IdParamSchema } from '#/modules/elysia/crud/types/id-param-schema';

export const createIdParamSchema = (): IdParamSchema => t.Object({
	id: t.Union([
		t.String({
			format: 'uuid'
		}),
		t.Number({
			minimum: 1,
			maximum: Number.MAX_SAFE_INTEGER
		})
	])
});
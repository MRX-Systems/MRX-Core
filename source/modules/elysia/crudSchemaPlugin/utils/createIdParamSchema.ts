import type { TNumber, TObject, TString, TUnion } from '@sinclair/typebox/type';
import { t } from 'elysia';

export const createIdParamSchema = (): TObject<{ id: TUnion<[TString, TNumber]> }> => t.Object({
	id: t.Union([t.String({
		format: 'uuid'
	}), t.Number({
		minimum: 1,
		maximum: Number.MAX_SAFE_INTEGER
	})])
});
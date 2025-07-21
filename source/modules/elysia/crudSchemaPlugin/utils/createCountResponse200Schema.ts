import type { TNumber, TObject, TString } from '@sinclair/typebox/type';
import { t } from 'elysia';

export const createCountResponse200Schema = (): TObject<{message: TString; content: TNumber;}> => t.Object({
	message: t.String(),
	content: t.Number()
});
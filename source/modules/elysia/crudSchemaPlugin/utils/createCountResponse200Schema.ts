import type { TNumber, TObject, TString } from '@sinclair/typebox/type';
import { t } from 'elysia';

/**
 * Creates a schema for the response of a count operation.
 * The response will contain a message and the count as content.
 *
 * @returns The schema for the count response.
 */
export const createCountResponse200Schema = (): TObject<{message: TString; content: TNumber;}> => t.Object({
	message: t.String(),
	content: t.Number()
});
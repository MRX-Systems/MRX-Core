import { t } from 'elysia';

import type { CountResponse200Schema } from '#/modules/elysia/crud/types/count-response-200-schema';

/**
 * Creates a schema for the response of a count operation.
 * The response will contain a message and the count as content.
 *
 * @returns The schema for the count response.
 */
export const createCountResponse200Schema = (): CountResponse200Schema => t.Object({
	message: t.String(),
	content: t.Number()
});
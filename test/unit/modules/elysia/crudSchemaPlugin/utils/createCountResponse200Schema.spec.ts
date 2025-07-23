import { describe, expect, test } from 'bun:test';
import { Kind } from '@sinclair/typebox';

import { createCountResponse200Schema } from '#/modules/elysia/crudSchemaPlugin/utils/createCountResponse200Schema';

describe('createCountResponse200Schema', () => {
	test('should create a schema with a good type and kind', () => {
		const schema = createCountResponse200Schema();
		expect(schema.type).toBe('object');
		expect(schema[Kind]).toBe('Object');
	});

	test('should have the correct properties', () => {
		const schema = createCountResponse200Schema();
		expect(schema.properties).toHaveProperty('message');
		expect(schema.properties).toHaveProperty('content');
	});

	test('should have the correct required properties', () => {
		const schema = createCountResponse200Schema();
		expect(schema.required).toEqual(['message', 'content']);
	});
});
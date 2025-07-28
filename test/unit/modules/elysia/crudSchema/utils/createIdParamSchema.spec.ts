import { Kind } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';

import { createIdParamSchema } from '#/modules/elysia/crudSchema/utils/createIdParamSchema';

describe('createIdParamSchema', () => {
	test('should create a schema with a good type and kind', () => {
		const schema = createIdParamSchema();
		expect(schema.type).toBe('object');
		expect(schema[Kind]).toBe('Object');
	});

	test('should have the correct properties', () => {
		const schema = createIdParamSchema();
		expect(schema.properties).toHaveProperty('id');
	});

	test('should id has a good type and kind', () => {
		const schema = createIdParamSchema();
		expect(schema.properties.id[Kind]).toBe('Union');
	});

	test('should required id', () => {
		const schema = createIdParamSchema();
		expect(schema.required).toContain('id');
	});

	test('should id is a union of string and number', () => {
		const schema = createIdParamSchema();
		expect(schema.properties.id.anyOf).toHaveLength(2);

		expect(schema.properties.id.anyOf[0][Kind]).toBe('String');
		expect(schema.properties.id.anyOf[0].type).toBe('string');
		expect(schema.properties.id.anyOf[0].format).toBe('uuid');

		expect(schema.properties.id.anyOf[1][Kind]).toBe('Number');
		expect(schema.properties.id.anyOf[1].type).toBe('number');
		expect(schema.properties.id.anyOf[1].minimum).toBe(1);
		expect(schema.properties.id.anyOf[1].maximum).toBe(Number.MAX_SAFE_INTEGER);
	});
});
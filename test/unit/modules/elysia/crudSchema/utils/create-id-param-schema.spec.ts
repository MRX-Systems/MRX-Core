import { Kind } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';

import { createIdParamSchema } from '#/modules/elysia/crud-schema/utils/create-id-param-schema';

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

	test('should id be a union with exactly 2 types', () => {
		const schema = createIdParamSchema();
		expect(schema.properties.id.anyOf).toHaveLength(2);
	});

	test('should id first union type be a string with uuid format', () => {
		const schema = createIdParamSchema();
		const [stringType] = schema.properties.id.anyOf;

		expect(stringType[Kind]).toBe('String');
		expect(stringType.type).toBe('string');
		expect(stringType.format).toBe('uuid');
	});

	test('should id second union type be a number with constraints', () => {
		const schema = createIdParamSchema();
		const [, numberType] = schema.properties.id.anyOf;

		expect(numberType[Kind]).toBe('Number');
		expect(numberType.type).toBe('number');
		expect(numberType.minimum).toBe(1);
		expect(numberType.maximum).toBe(Number.MAX_SAFE_INTEGER);
	});
});
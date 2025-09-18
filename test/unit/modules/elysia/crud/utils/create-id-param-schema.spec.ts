import { KindGuard } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';

import { createIdParamSchema } from '#/modules/elysia/crud/utils/create-id-param-schema';

describe('createIdParamSchema', () => {
	test('should create a schema with a good type', () => {
		const schema = createIdParamSchema();
		expect(KindGuard.IsObject(schema)).toBe(true);
	});

	test('should have the correct properties', () => {
		const schema = createIdParamSchema();
		expect(schema.properties).toHaveProperty('id');
	});

	test('should id has a good type', () => {
		const schema = createIdParamSchema();
		expect(KindGuard.IsUnion(schema.properties.id)).toBe(true);
	});

	test('should required id', () => {
		const schema = createIdParamSchema();
		expect(schema.required).toContain('id');
	});

	test('should id be a union with exactly 2 types', () => {
		const schema = createIdParamSchema();
		expect(schema.properties.id.anyOf).toHaveLength(2);
	});

	test('should id first union type be a string', () => {
		const schema = createIdParamSchema();
		const [stringType] = schema.properties.id.anyOf;

		expect(KindGuard.IsString(stringType)).toBe(true);
	});

	test('should id second union type be a number with constraints', () => {
		const schema = createIdParamSchema();
		const [, numberType] = schema.properties.id.anyOf;

		expect(KindGuard.IsNumber(numberType)).toBe(true);
		expect(numberType.minimum).toBe(1);
		expect(numberType.maximum).toBe(Number.MAX_SAFE_INTEGER);
	});
});
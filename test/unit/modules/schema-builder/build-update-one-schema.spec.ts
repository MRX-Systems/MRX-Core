import { KindGuard, OptionalKind } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';
import { t } from 'elysia';

import { buildUpdateOneSchema } from '#/modules/schema-builder/build-update-one-schema';

const sourceSchema = t.Object({
	id: t.Number(),
	name: t.String(),
	age: t.Number()
});

describe.concurrent('buildUpdateOneSchema', () => {
	test('should create a schema with a good type and kind', () => {
		const schema = buildUpdateOneSchema(sourceSchema);
		expect(KindGuard.IsObject(schema)).toBe(true);
	});

	test('should have the correct properties', () => {
		const schema = buildUpdateOneSchema(sourceSchema);
		expect(schema.properties).toHaveProperty('data');
	});

	test('should data has a good type and kind', () => {
		const schema = buildUpdateOneSchema(sourceSchema);
		expect(KindGuard.IsObject(schema.properties.data)).toBe(true);
		expect(schema.properties.data.type).toBe('object');
	});

	test('should data can be a single object', () => {
		const schema = buildUpdateOneSchema(sourceSchema);
		for (const key of Object.keys(sourceSchema.properties))
			expect(schema.properties.data.properties).toHaveProperty(key);
	});

	test('should each properties is optional', () => {
		const schema = buildUpdateOneSchema(sourceSchema);
		for (const key of Object.keys(sourceSchema.properties))
			expect(schema.properties.data.properties[key as keyof typeof schema.properties.data.properties][OptionalKind]).toBe('Optional');
	});

	test('should data is required', () => {
		const schema = buildUpdateOneSchema(sourceSchema);
		expect(schema.required).toContain('data');
	});
});
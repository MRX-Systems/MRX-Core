import { KindGuard } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';
import { t } from 'elysia';

import { createInsertSchema } from '#/modules/elysia/crud/utils/create-insert-schema';

const sourceSchema = t.Object({
	id: t.Number(),
	name: t.String(),
	age: t.Number()
});

describe('createInsertSchema', () => {
	test('should create a schema with a good type', () => {
		const schema = createInsertSchema(sourceSchema);
		expect(KindGuard.IsObject(schema)).toBe(true);
	});

	test('should have the correct properties', () => {
		const schema = createInsertSchema(sourceSchema);
		expect(schema.properties).toHaveProperty('queryOptions');
		expect(schema.properties).toHaveProperty('data');
	});

	test('should queryOptions has a good type', () => {
		const schema = createInsertSchema(sourceSchema);
		expect(KindGuard.IsObject(schema.properties.queryOptions)).toBe(true);
	});

	test('should queryOptions is optional', () => {
		const schema = createInsertSchema(sourceSchema);
		expect(KindGuard.IsOptional(schema.properties.queryOptions)).toBe(true);
	});

	test('should queryOptions has the correct properties', () => {
		const schema = createInsertSchema(sourceSchema);
		expect(schema.properties.queryOptions.properties).toHaveProperty('selectedFields');
	});

	test('should selectedFields is required', () => {
		const schema = createInsertSchema(sourceSchema);
		expect(schema.properties.queryOptions.required).toContain('selectedFields');
	});

	test('should data has a good type', () => {
		const schema = createInsertSchema(sourceSchema);
		expect(KindGuard.IsUnion(schema.properties.data)).toBe(true);
	});

	test('should data can be a single object or an array of objects', () => {
		const schema = createInsertSchema(sourceSchema);
		expect(schema.properties.data.anyOf).toHaveLength(2);
		expect(KindGuard.IsObject(schema.properties.data.anyOf[0])).toBe(true);
		for (const key of Object.keys(sourceSchema.properties))
			expect(schema.properties.data.anyOf[0].properties).toHaveProperty(key);

		expect(KindGuard.IsArray(schema.properties.data.anyOf[1])).toBe(true);
		expect(schema.properties.data.anyOf[1].items.type).toBe('object');
		expect(KindGuard.IsObject(schema.properties.data.anyOf[1].items)).toBe(true);
		for (const key of Object.keys(sourceSchema.properties))
			expect(schema.properties.data.anyOf[1].items.properties).toHaveProperty(key);
	});

	test('should data is required', () => {
		const schema = createInsertSchema(sourceSchema);
		expect(schema.required).toContain('data');
	});
});
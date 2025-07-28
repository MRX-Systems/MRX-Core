import { Kind, OptionalKind } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';
import { t } from 'elysia';

import { createInsertSchema } from '#/modules/elysia/crudSchema/utils/createInsertSchema';

const sourceSchema = t.Object({
	id: t.Number(),
	name: t.String(),
	age: t.Number()
});

describe('createIdParamSchema', () => {
	test('should create a schema with a good type and kind', () => {
		const schema = createInsertSchema(sourceSchema);
		expect(schema.type).toBe('object');
		expect(schema[Kind]).toBe('Object');
	});

	test('should have the correct properties', () => {
		const schema = createInsertSchema(sourceSchema);
		expect(schema.properties).toHaveProperty('queryOptions');
		expect(schema.properties).toHaveProperty('data');
	});

	test('should queryOptions has a good type and kind', () => {
		const schema = createInsertSchema(sourceSchema);
		expect(schema.properties.queryOptions.type).toBe('object');
		expect(schema.properties.queryOptions[Kind]).toBe('Object');
	});

	test('should queryOptions is optional', () => {
		const schema = createInsertSchema(sourceSchema);
		expect(schema.properties.queryOptions[OptionalKind]).toBe('Optional');
	});

	test('should queryOptions has the correct properties', () => {
		const schema = createInsertSchema(sourceSchema);
		expect(schema.properties.queryOptions.properties).toHaveProperty('selectedFields');
	});

	test('should selectedFields is required', () => {
		const schema = createInsertSchema(sourceSchema);
		expect(schema.properties.queryOptions.required).toContain('selectedFields');
	});

	test('should data has a good type and kind', () => {
		const schema = createInsertSchema(sourceSchema);
		expect(schema.properties.data[Kind]).toBe('Union');
	});

	test('should data can be a single object or an array of objects', () => {
		const schema = createInsertSchema(sourceSchema);
		expect(schema.properties.data.anyOf).toHaveLength(2);
		expect(schema.properties.data.anyOf[0].type).toBe('object');
		expect(schema.properties.data.anyOf[0][Kind]).toBe('Object');
		for (const key of Object.keys(sourceSchema.properties))
			expect(schema.properties.data.anyOf[0].properties).toHaveProperty(key);

		expect(schema.properties.data.anyOf[1].type).toBe('array');
		expect(schema.properties.data.anyOf[1][Kind]).toBe('Array');
		expect(schema.properties.data.anyOf[1].items.type).toBe('object');
		expect(schema.properties.data.anyOf[1].items[Kind]).toBe('Object');
		for (const key of Object.keys(sourceSchema.properties))
			expect(schema.properties.data.anyOf[1].items.properties).toHaveProperty(key);
	});

	test('should data is required', () => {
		const schema = createInsertSchema(sourceSchema);
		expect(schema.required).toContain('data');
	});
});
import { Kind, OptionalKind } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';
import { t } from 'elysia';

import { createUpdateSchema } from '#/modules/elysia/crudSchema/utils/createUpdateSchema';

const sourceSchema = t.Object({
	id: t.Number(),
	name: t.String(),
	age: t.Number()
});

describe('createUpdateSchema', () => {
	test('should create a schema with a good type and kind', () => {
		const schema = createUpdateSchema(sourceSchema);
		expect(schema.type).toBe('object');
		expect(schema[Kind]).toBe('Object');
	});

	test('should have the correct properties', () => {
		const schema = createUpdateSchema(sourceSchema);
		expect(schema.properties).toHaveProperty('queryOptions');
		expect(schema.properties).toHaveProperty('data');
	});

	test('should queryOptions has a good type and kind', () => {
		const schema = createUpdateSchema(sourceSchema);
		expect(schema.properties.queryOptions.type).toBe('object');
	});

	test('should queryOptions has the correct properties', () => {
		const schema = createUpdateSchema(sourceSchema);
		expect(schema.properties.queryOptions.properties).toHaveProperty('selectedFields');
		expect(schema.properties.queryOptions.properties).toHaveProperty('filters');
	});

	test('should selectedFields has a good type and kind', () => {
		const schema = createUpdateSchema(sourceSchema);
		expect(schema.properties.queryOptions.properties.selectedFields[Kind]).toBe('Union');
	});

	test('should selectedFields can be optional', () => {
		const schema = createUpdateSchema(sourceSchema);
		expect(schema.properties.queryOptions.properties.selectedFields[OptionalKind]).toBe('Optional');
	});

	test('should filters has a good type and kind', () => {
		const schema = createUpdateSchema(sourceSchema);
		expect(schema.properties.queryOptions.properties.filters[Kind]).toBe('Union');
	});

	test('should filter is required', () => {
		const schema = createUpdateSchema(sourceSchema);
		expect(schema.properties.queryOptions.required).toContain('filters');
	});

	test('should queryOptions is required', () => {
		const schema = createUpdateSchema(sourceSchema);
		expect(schema.required).toContain('queryOptions');
	});

	test('should data has a good type and kind', () => {
		const schema = createUpdateSchema(sourceSchema);
		expect(schema.properties.data[Kind]).toBe('Object');
		expect(schema.properties.data.type).toBe('object');
	});

	test('should data can be a single object', () => {
		const schema = createUpdateSchema(sourceSchema);
		for (const key of Object.keys(sourceSchema.properties))
			expect(schema.properties.data.properties).toHaveProperty(key);
	});

	test('should each properties is optional', () => {
		const schema = createUpdateSchema(sourceSchema);
		for (const key of Object.keys(sourceSchema.properties))
			expect(schema.properties.data.properties[key as keyof typeof schema.properties.data.properties][OptionalKind]).toBe('Optional');
	});

	test('should data is required', () => {
		const schema = createUpdateSchema(sourceSchema);
		expect(schema.required).toContain('data');
	});
});
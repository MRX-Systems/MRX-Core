import { Kind, OptionalKind } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';
import { t } from 'elysia';

import { createUpdateOneSchema } from '#/modules/elysia/crud/utils/create-update-one-schema';

const sourceSchema = t.Object({
	id: t.Number(),
	name: t.String(),
	age: t.Number()
});

describe('createUpdateOneSchema', () => {
	test('should create a schema with a good type and kind', () => {
		const schema = createUpdateOneSchema(sourceSchema);
		expect(schema.type).toBe('object');
		expect(schema[Kind]).toBe('Object');
	});

	test('should have the correct properties', () => {
		const schema = createUpdateOneSchema(sourceSchema);
		expect(schema.properties).toHaveProperty('data');
	});

	test('should data has a good type and kind', () => {
		const schema = createUpdateOneSchema(sourceSchema);
		expect(schema.properties.data[Kind]).toBe('Object');
		expect(schema.properties.data.type).toBe('object');
	});

	test('should data can be a single object', () => {
		const schema = createUpdateOneSchema(sourceSchema);
		for (const key of Object.keys(sourceSchema.properties))
			expect(schema.properties.data.properties).toHaveProperty(key);
	});

	test('should each properties is optional', () => {
		const schema = createUpdateOneSchema(sourceSchema);
		for (const key of Object.keys(sourceSchema.properties))
			expect(schema.properties.data.properties[key as keyof typeof schema.properties.data.properties][OptionalKind]).toBe('Optional');
	});

	test('should data is required', () => {
		const schema = createUpdateOneSchema(sourceSchema);
		expect(schema.required).toContain('data');
	});
});
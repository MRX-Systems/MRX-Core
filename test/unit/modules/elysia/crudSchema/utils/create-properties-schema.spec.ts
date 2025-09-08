import { Kind, type TSchema } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';
import { t } from 'elysia/type-system';

import { createPropertiesSchema } from '#/modules/elysia/crud-schema/utils/create-properties-schema';

const sourceSchema = t.Object({
	id: t.Number(),
	name: t.String(),
	age: t.Number()
});

describe('createPropertiesSchema', () => {
	test('should create as schema with a good type and kind', () => {
		const schema = createPropertiesSchema(sourceSchema);
		expect(schema.type).toBe('object');
		expect(schema[Kind]).toBe('Object');
	});

	test('should have the correct properties', () => {
		const schema = createPropertiesSchema(sourceSchema);
		for (const key of Object.keys(sourceSchema.properties))
			expect(schema.properties).toHaveProperty(key);
	});

	test('should each property has a good type and kind', () => {
		const schema = createPropertiesSchema(sourceSchema);
		for (const key of Object.keys(sourceSchema.properties)) {
			const propertySchema = schema.properties[key as keyof typeof schema.properties];
			expect(propertySchema[Kind]).toBe('Union');
		}
	});

	test('should each property is a union of adaptive where clause and original type', () => {
		const schema = createPropertiesSchema(sourceSchema);
		for (const key of Object.keys(sourceSchema.properties)) {
			const propertySchema = schema.properties[key as keyof typeof schema.properties] as TSchema;
			expect(propertySchema[Kind]).toBe('Union');
			expect(propertySchema.anyOf).toHaveLength(2);
			expect(propertySchema.anyOf[0][Kind]).toBe('Object'); // Adaptive where clause schema
			expect(propertySchema.anyOf[1]).toEqual(sourceSchema.properties[key as keyof typeof sourceSchema.properties]);
		}
	});

	test('should each properties is required', () => {
		const schema = createPropertiesSchema(sourceSchema);
		for (const key of Object.keys(sourceSchema.properties))
			expect(schema.required).toContain(key);
	});
});
import { KindGuard, type TSchema } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';
import { t } from 'elysia/type-system';

import { createPropertiesSchema } from '#/modules/elysia/crud/utils/create-properties-schema';

const sourceSchema = t.Object({
	id: t.Number(),
	name: t.String(),
	age: t.Number()
});

describe('createPropertiesSchema', () => {
	test('should create as schema with a good type', () => {
		const schema = createPropertiesSchema(sourceSchema);
		expect(KindGuard.IsObject(schema)).toBe(true);
	});

	test('should have the correct properties', () => {
		const schema = createPropertiesSchema(sourceSchema);
		for (const key of Object.keys(sourceSchema.properties))
			expect(schema.properties).toHaveProperty(key);
	});

	test('should each property has a good type', () => {
		const schema = createPropertiesSchema(sourceSchema);
		for (const key of Object.keys(sourceSchema.properties)) {
			const propertySchema = schema.properties[key as keyof typeof schema.properties];
			expect(KindGuard.IsUnion(propertySchema)).toBe(true);
		}
	});

	test('should each property is a union of adaptive where clause and original type', () => {
		const schema = createPropertiesSchema(sourceSchema);
		for (const key of Object.keys(sourceSchema.properties)) {
			const propertySchema = schema.properties[key as keyof typeof schema.properties] as TSchema;
			expect(KindGuard.IsUnion(propertySchema)).toBe(true);
			expect(propertySchema.anyOf).toHaveLength(2);
			expect(KindGuard.IsObject(propertySchema.anyOf[0])).toBe(true); // Adaptive where clause schema
			expect(propertySchema.anyOf[1]).toEqual(sourceSchema.properties[key as keyof typeof sourceSchema.properties]);
		}
	});

	test('should each properties is required', () => {
		const schema = createPropertiesSchema(sourceSchema);
		for (const key of Object.keys(sourceSchema.properties))
			expect(schema.required).toContain(key);
	});

	test('should handle union type', () => {
		const sourceSchema = t.Object({
			date: t.Union([t.Number(), t.Union([t.String()])])
		});
		const schema = createPropertiesSchema(sourceSchema);
		for (const key of Object.keys(sourceSchema.properties)) {
			const propertySchema = schema.properties[key as keyof typeof schema.properties];
			expect(KindGuard.IsUnion(propertySchema)).toBe(true);
			expect(propertySchema.anyOf).toHaveLength(3);
			expect(KindGuard.IsObject(propertySchema.anyOf[0])).toBe(true);
			expect(KindGuard.IsNumber(propertySchema.anyOf[1])).toBe(true);
			expect(KindGuard.IsString(propertySchema.anyOf[2])).toBe(true);
		}
	});
});
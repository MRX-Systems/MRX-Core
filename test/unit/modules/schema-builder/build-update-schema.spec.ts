import { KindGuard } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';
import { t } from 'elysia';

import { buildUpdateSchema } from '#/modules/schema-builder/build-update-schema';

const sourceSchema = t.Object({
	id: t.Number(),
	name: t.String(),
	age: t.Number()
});

describe.concurrent('buildUpdateSchema', () => {
	test('should create a schema with a good type', () => {
		const schema = buildUpdateSchema(sourceSchema);
		expect(KindGuard.IsObject(schema)).toBe(true);
	});

	test('should have the correct properties', () => {
		const schema = buildUpdateSchema(sourceSchema);
		expect(schema.properties).toHaveProperty('queryOptions');
		expect(schema.properties).toHaveProperty('data');
	});

	test('should queryOptions has a good type', () => {
		const schema = buildUpdateSchema(sourceSchema);
		expect(KindGuard.IsObject(schema.properties.queryOptions)).toBe(true);
	});

	test('should queryOptions has the correct properties', () => {
		const schema = buildUpdateSchema(sourceSchema);
		expect(schema.properties.queryOptions.properties).toHaveProperty('selectedFields');
		expect(schema.properties.queryOptions.properties).toHaveProperty('filters');
	});

	test('should selectedFields has a good type', () => {
		const schema = buildUpdateSchema(sourceSchema);
		expect(KindGuard.IsUnion(schema.properties.queryOptions.properties.selectedFields)).toBe(true);
	});

	test('should selectedFields can be optional', () => {
		const schema = buildUpdateSchema(sourceSchema);
		expect(KindGuard.IsOptional(schema.properties.queryOptions.properties.selectedFields)).toBe(true);
	});

	test('should filters has a good type', () => {
		const schema = buildUpdateSchema(sourceSchema);
		expect(KindGuard.IsUnion(schema.properties.queryOptions.properties.filters)).toBe(true);
	});

	test('should filter is required', () => {
		const schema = buildUpdateSchema(sourceSchema);
		expect(schema.properties.queryOptions.required).toContain('filters');
	});

	test('should queryOptions is required', () => {
		const schema = buildUpdateSchema(sourceSchema);
		expect(schema.required).toContain('queryOptions');
	});

	test('should data has a good type and kind', () => {
		const schema = buildUpdateSchema(sourceSchema);
		expect(KindGuard.IsObject(schema.properties.data)).toBe(true);
	});

	test('should data can be a single object', () => {
		const schema = buildUpdateSchema(sourceSchema);
		for (const key of Object.keys(sourceSchema.properties))
			expect(schema.properties.data.properties).toHaveProperty(key);
	});

	test('should each properties is optional', () => {
		const schema = buildUpdateSchema(sourceSchema);
		for (const key of Object.keys(sourceSchema.properties))
			expect(KindGuard.IsOptional(schema.properties.data.properties[key as keyof typeof schema.properties.data.properties])).toBe(true);
	});

	test('should data is required', () => {
		const schema = buildUpdateSchema(sourceSchema);
		expect(schema.required).toContain('data');
	});
});
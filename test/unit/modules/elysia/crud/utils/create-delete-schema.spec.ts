import { KindGuard } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';
import { t } from 'elysia';

import { createDeleteSchema } from '#/modules/elysia/crud/utils/create-delete-schema';

const sourceSchema = t.Object({
	id: t.Number(),
	name: t.String(),
	age: t.Number()
});

describe('createDeleteSchema', () => {
	test('should create a schema with a good type', () => {
		const schema = createDeleteSchema(sourceSchema);
		expect(KindGuard.IsObject(schema)).toBe(true);
	});

	test('should have the correct properties with queryOptions', () => {
		const schema = createDeleteSchema(sourceSchema);
		expect(schema.properties).toHaveProperty('queryOptions');
	});

	test('should verify queryOptions has good type', () => {
		const schema = createDeleteSchema(sourceSchema);
		expect(KindGuard.IsObject(schema.properties.queryOptions)).toBe(true);
	});

	test('should queryOptions is required', () => {
		const schema = createDeleteSchema(sourceSchema);
		expect(schema.required).toEqual(['queryOptions']);
	});

	test('should queryOptions has only filters and selectedFields', () => {
		const schema = createDeleteSchema(sourceSchema);
		expect(schema.properties.queryOptions.properties).toHaveProperty('filters');
		expect(schema.properties.queryOptions.properties).toHaveProperty('selectedFields');
		expect(Object.keys(schema.properties.queryOptions.properties).length).toBe(2);
	});

	test('should selectedFields be optional', () => {
		const schema = createDeleteSchema(sourceSchema);
		expect(KindGuard.IsUnion(schema.properties.queryOptions.properties.selectedFields)).toBe(true);
		expect(KindGuard.IsOptional(schema.properties.queryOptions.properties.selectedFields)).toBe(true);
	});

	test('should verify filters are required', () => {
		const schema = createDeleteSchema(sourceSchema);
		expect(schema.properties.queryOptions.required).toEqual(['filters']);
	});

	test('should verify filters has good type', () => {
		const schema = createDeleteSchema(sourceSchema);
		expect(KindGuard.IsUnion(schema.properties.queryOptions.properties.filters)).toBe(true);
	});
});
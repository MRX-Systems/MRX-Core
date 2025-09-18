import { KindGuard } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';
import { t } from 'elysia';

import { createCountSchema } from '#/modules/elysia/crud/utils/create-count-schema';

const sourceSchema = t.Object({
	id: t.Number(),
	name: t.String(),
	age: t.Number()
});

describe('createCountSchema', () => {
	test('should create a schema with a good type', () => {
		const schema = createCountSchema(sourceSchema);
		expect(KindGuard.IsObject(schema)).toBe(true);
	});

	test('should have the correct properties with queryOptions', () => {
		const schema = createCountSchema(sourceSchema);
		expect(schema.properties).toHaveProperty('queryOptions');
	});

	test('should queryOptions has correct type', () => {
		const schema = createCountSchema(sourceSchema);
		expect(KindGuard.IsObject(schema.properties.queryOptions)).toBe(true);
	});

	test('should queryOptions has correct properties', () => {
		const schema = createCountSchema(sourceSchema);
		expect(schema.properties.queryOptions.properties).toHaveProperty('filters');
	});

	test('should filters be optional', () => {
		const schema = createCountSchema(sourceSchema);
		expect(KindGuard.IsOptional(schema.properties.queryOptions.properties.filters)).toBe(true);
	});

	test('should filters be a union of object and array', () => {
		const schema = createCountSchema(sourceSchema);
		const { filters } = schema.properties.queryOptions.properties;

		expect(KindGuard.IsUnion(filters)).toBe(true);
		expect(KindGuard.IsOptional(filters)).toBe(true);
		expect(filters.anyOf).toHaveLength(2);
		expect(KindGuard.IsObject(filters.anyOf[0])).toBe(true);
		expect(KindGuard.IsArray(filters.anyOf[1])).toBe(true);
	});

	test('should queryOptions be optional', () => {
		const schema = createCountSchema(sourceSchema);
		expect(KindGuard.IsOptional(schema.properties.queryOptions)).toBe(true);
	});
});
import { Kind, OptionalKind } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';
import { t } from 'elysia';

import { createCountSchema } from '#/modules/elysia/crud-schema/utils/create-count-schema';

const sourceSchema = t.Object({
	id: t.Number(),
	name: t.String(),
	age: t.Number()
});

describe('createCountSchema', () => {
	test('should create a schema with a good type and kind', () => {
		const schema = createCountSchema(sourceSchema);
		expect(schema.type).toBe('object');
		expect(schema[Kind]).toBe('Object');
	});

	test('should have the correct properties with queryOptions', () => {
		const schema = createCountSchema(sourceSchema);
		expect(schema.properties).toHaveProperty('queryOptions');
	});

	test('should queryOptions has correct type and kind', () => {
		const schema = createCountSchema(sourceSchema);
		expect(schema.properties.queryOptions.type).toBe('object');
		expect(schema.properties.queryOptions[Kind]).toBe('Object');
	});

	test('should queryOptions has correct properties', () => {
		const schema = createCountSchema(sourceSchema);
		expect(schema.properties.queryOptions.properties).toHaveProperty('filters');
	});

	test('should filters be optional', () => {
		const schema = createCountSchema(sourceSchema);
		expect(schema.properties.queryOptions.properties.filters[OptionalKind]).toBe('Optional');
	});

	test('should filters be a union of partial filter schemas', () => {
		const schema = createCountSchema(sourceSchema);
		const { filters } = schema.properties.queryOptions.properties;

		expect(filters[Kind]).toBe('Union');
		expect(filters[OptionalKind]).toBe('Optional');
		expect(filters.anyOf).toHaveLength(2);
		expect(filters.anyOf[0][Kind]).toBe('Object');
		expect(filters.anyOf[0].type).toBe('object');
		expect(filters.anyOf[1][Kind]).toBe('Array');
		expect(filters.anyOf[1].type).toBe('array');
	});

	test('should queryOptions be optional', () => {
		const schema = createCountSchema(sourceSchema);
		expect(schema.properties.queryOptions[OptionalKind]).toBe('Optional');
	});
});
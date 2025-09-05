import { Kind, OptionalKind } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';
import { t } from 'elysia';

import { createFindSchema } from '#/modules/elysia/crud-schema/utils/create-find-schema';

const sourceSchema = t.Object({
	id: t.Number(),
	name: t.String(),
	age: t.Number()
});

describe('createFindSchema', () => {
	test('should create a schema with a good type and kind', () => {
		const schema = createFindSchema(sourceSchema);
		expect(schema.type).toBe('object');
		expect(schema[Kind]).toBe('Object');
	});

	test('should have the correct properties with queryOptions', () => {
		const schema = createFindSchema(sourceSchema);
		expect(schema.properties).toHaveProperty('queryOptions');
	});

	test('should queryOptions has a good type, kind', () => {
		const schema = createFindSchema(sourceSchema);
		expect(schema.properties.queryOptions.type).toBe('object');
		expect(schema.properties.queryOptions[Kind]).toBe('Object');
	});

	test('should queryOptions is optional', () => {
		const schema = createFindSchema(sourceSchema);
		expect(schema.properties.queryOptions[OptionalKind]).toBe('Optional');
	});

	test('should queryOptions has the correct properties', () => {
		const schema = createFindSchema(sourceSchema);
		expect(schema.properties.queryOptions.properties).toHaveProperty('selectedFields');
		expect(schema.properties.queryOptions.properties).toHaveProperty('orderBy');
		expect(schema.properties.queryOptions.properties).toHaveProperty('filters');
		expect(schema.properties.queryOptions.properties).toHaveProperty('limit');
		expect(schema.properties.queryOptions.properties).toHaveProperty('offset');
	});

	test('should selectedFields is optionnal', () => {
		const schema = createFindSchema(sourceSchema);
		expect(schema.properties.queryOptions.properties.selectedFields[OptionalKind]).toBe('Optional');
	});

	test('should orderBy is optionnal', () => {
		const schema = createFindSchema(sourceSchema);
		expect(schema.properties.queryOptions.properties.orderBy[OptionalKind]).toBe('Optional');
	});

	test('should filters is optionnal', () => {
		const schema = createFindSchema(sourceSchema);
		expect(schema.properties.queryOptions.properties.filters[OptionalKind]).toBe('Optional');
	});

	test('should limit is optionnal', () => {
		const schema = createFindSchema(sourceSchema);
		expect(schema.properties.queryOptions.properties.limit[OptionalKind]).toBe('Optional');
	});

	test('should limit is a number', () => {
		const schema = createFindSchema(sourceSchema);
		expect(schema.properties.queryOptions.properties.limit.type).toBe('number');
		expect(schema.properties.queryOptions.properties.limit[Kind]).toBe('Number');
	});

	test('should limit has a minimum of 1', () => {
		const schema = createFindSchema(sourceSchema);
		expect(schema.properties.queryOptions.properties.limit.minimum).toBe(1);
	});

	test('should limit has a default of 100', () => {
		const schema = createFindSchema(sourceSchema);
		expect(schema.properties.queryOptions.properties.limit.default).toBe(100);
	});

	test('should offset is a number', () => {
		const schema = createFindSchema(sourceSchema);
		expect(schema.properties.queryOptions.properties.offset.type).toBe('number');
		expect(schema.properties.queryOptions.properties.offset[Kind]).toBe('Number');
	});

	test('should offset has a minimum of 0', () => {
		const schema = createFindSchema(sourceSchema);
		expect(schema.properties.queryOptions.properties.offset.minimum).toBe(0);
	});

	test('should offset has a default of 0', () => {
		const schema = createFindSchema(sourceSchema);
		expect(schema.properties.queryOptions.properties.offset.default).toBe(0);
	});

	test('should offset is optionnal', () => {
		const schema = createFindSchema(sourceSchema);
		expect(schema.properties.queryOptions.properties.offset[OptionalKind]).toBe('Optional');
	});
});
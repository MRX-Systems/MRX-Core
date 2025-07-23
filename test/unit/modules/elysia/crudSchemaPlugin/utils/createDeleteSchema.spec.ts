import { Kind, OptionalKind } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';
import { t } from 'elysia';

import { createDeleteSchema } from '#/modules/elysia/crudSchemaPlugin/utils/createDeleteSchema';

const sourceSchema = t.Object({
	id: t.Number(),
	name: t.String(),
	age: t.Number()
});

describe('createDeleteSchema', () => {
	test('should create a schema with a good type and kind', () => {
		const schema = createDeleteSchema(sourceSchema);
		expect(schema.type).toBe('object');
		expect(schema[Kind]).toBe('Object');
	});

	test('should have the correct properties with queryOptions', () => {
		const schema = createDeleteSchema(sourceSchema);
		expect(schema.properties).toHaveProperty('queryOptions');
	});

	test('should queryOptions has a good type, kind', () => {
		const schema = createDeleteSchema(sourceSchema);
		expect(schema.properties.queryOptions.type).toBe('object');
		expect(schema.properties.queryOptions[Kind]).toBe('Object');
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
		expect(schema.properties.queryOptions.properties.selectedFields[Kind]).toBe('Union');
		expect(schema.properties.queryOptions.properties.selectedFields[OptionalKind]).toBe('Optional');
	});

	test('should filter is required', () => {
		const schema = createDeleteSchema(sourceSchema);
		expect(schema.properties.queryOptions.required).toEqual(['filters']);
	});
});
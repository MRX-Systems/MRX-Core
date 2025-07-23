import { describe, expect, test } from 'bun:test';
import { Kind, OptionalKind } from '@sinclair/typebox';
import { t } from 'elysia';

import { createCountSchema } from '#/modules/elysia/crudSchemaPlugin/utils/createCountSchema';

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

	test('should queryOptions has a good type, kind and optionalKind', () => {
		const schema = createCountSchema(sourceSchema);
		expect(schema.properties.queryOptions.type).toBe('object');
		expect(schema.properties.queryOptions[Kind]).toBe('Object');
		expect(schema.properties.queryOptions[OptionalKind]).toBe('Optional');
	});

	test('should queryOptions has only filters', () => {
		const schema = createCountSchema(sourceSchema);
		expect(schema.properties.queryOptions.properties).toHaveProperty('filters');
		expect(Object.keys(schema.properties.queryOptions.properties).length).toBe(1);
	});
});
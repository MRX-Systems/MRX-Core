import { Kind } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';
import { t } from 'elysia';

import { createFiltersSchema } from '#/modules/elysia/crudSchemaPlugin/utils/createFiltersSchema';

const sourceSchema = t.Object({
	id: t.Number(),
	name: t.String(),
	age: t.Number()
});

describe('createFiltersSchema', () => {
	test('should create a schema with a good type and kind', () => {
		const schema = createFiltersSchema(sourceSchema);
		expect(schema.type).toBe('object');
		expect(schema[Kind]).toBe('Object');
	});

	test('should have the correct properties', () => {
		const schema = createFiltersSchema(sourceSchema);
		expect(schema.properties).toHaveProperty('$q');
		for (const key of Object.keys(sourceSchema.properties))
			expect(schema.properties).toHaveProperty(key);
	});

	test('should properties are required', () => {
		const schema = createFiltersSchema(sourceSchema);
		expect(schema.required).toEqual(['$q', ...Object.keys(sourceSchema.properties)]);
	});
});
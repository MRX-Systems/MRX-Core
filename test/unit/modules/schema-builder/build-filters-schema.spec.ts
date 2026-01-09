import { KindGuard } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';
import { t } from 'elysia';

import { buildFilterSchema } from '#/modules/schema-builder/build-filters-schema';

const sourceSchema = t.Object({
	id: t.Number(),
	name: t.String(),
	age: t.Number()
});

describe.concurrent('buildFilterSchema', () => {
	test('should create a schema with a good type', () => {
		const schema = buildFilterSchema(sourceSchema);
		expect(KindGuard.IsObject(schema)).toBe(true);
	});

	test('should have the correct properties', () => {
		const schema = buildFilterSchema(sourceSchema);
		expect(schema.properties).toHaveProperty('$q');
		for (const key of Object.keys(sourceSchema.properties))
			expect(schema.properties).toHaveProperty(key);
	});

	test('should verify properties are required', () => {
		const schema = buildFilterSchema(sourceSchema);
		expect(schema.required).toEqual(['$q', ...Object.keys(sourceSchema.properties)]);
	});

	test('should have a minimum of one property', () => {
		const schema = buildFilterSchema(sourceSchema);
		expect(schema.minProperties).toBe(1);
	});
});
import { KindGuard } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';
import { t } from 'elysia/type-system';

import { buildOrderBySchema } from '#/modules/schema-builder/build-order-by-schema';

const baseSchema = t.Object({
	id: t.Number(),
	name: t.String(),
	createdAt: t.String({ format: 'date-time' }),
	updatedAt: t.Date()
});

describe.concurrent('buildOrderBySchema', () => {
	test('should create a schema with an object type', () => {
		const orderBySchema = buildOrderBySchema(baseSchema);
		expect(KindGuard.IsObject(orderBySchema)).toBe(true);
	});

	test('should have required selectedField and direction properties', () => {
		const orderBySchema = buildOrderBySchema(baseSchema);

		expect(orderBySchema.required).toContain('selectedField');
		expect(orderBySchema.required).toContain('direction');
		expect(orderBySchema.properties).toBeDefined();
	});

	test('should have selectedField property defined', () => {
		const orderBySchema = buildOrderBySchema(baseSchema);

		expect(orderBySchema.properties.selectedField).toBeDefined();
	});

	test('should have direction property defined', () => {
		const orderBySchema = buildOrderBySchema(baseSchema);

		expect(orderBySchema.properties.direction).toBeDefined();
	});

	test('selectedField should be a union with all base schema keys', () => {
		const orderBySchema = buildOrderBySchema(baseSchema);
		const { selectedField } = orderBySchema.properties;

		expect(KindGuard.IsUnion(selectedField)).toBe(true);
		expect(selectedField.anyOf).toBeDefined();
		expect(selectedField.anyOf).toHaveLength(Object.keys(baseSchema.properties).length);

		const baseKeys = Object.keys(baseSchema.properties);
		const selectedFieldKeys = selectedField.anyOf.map((item) => item.const) as string[];

		for (const key of baseKeys)
			expect(selectedFieldKeys).toContain(key);
	});

	test('direction should be a union with asc and desc values', () => {
		const orderBySchema = buildOrderBySchema(baseSchema);
		const { direction } = orderBySchema.properties;

		expect(KindGuard.IsUnion(direction)).toBe(true);
		expect(direction.anyOf).toBeDefined();
		expect(direction.anyOf).toHaveLength(2);

		const directionValues = direction.anyOf.map((item) => item.const) as string[];
		expect(directionValues).toContain('asc');
		expect(directionValues).toContain('desc');
	});

	test('should have exactly two properties', () => {
		const orderBySchema = buildOrderBySchema(baseSchema);

		expect(Object.keys(orderBySchema.properties)).toHaveLength(2);
	});

	test('should work with different schema sizes', () => {
		const smallSchema = t.Object({
			id: t.Number()
		});

		const orderBySchema = buildOrderBySchema(smallSchema);
		const { selectedField } = orderBySchema.properties;

		// With a single key, KeyOf returns a Literal instead of a Union
		expect(KindGuard.IsLiteral(selectedField)).toBe(true);
		expect(selectedField.const).toBe('id');
	});

	test('should preserve direction options regardless of source schema', () => {
		const simpleSchema = t.Object({
			value: t.String()
		});

		const orderBySchema = buildOrderBySchema(simpleSchema);
		const { direction } = orderBySchema.properties;

		expect(direction.anyOf).toHaveLength(2);

		const directionValues = direction.anyOf.map((item) => item.const) as string[];
		expect(directionValues).toContain('asc');
		expect(directionValues).toContain('desc');
	});
});
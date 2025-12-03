import { t } from 'elysia';
import { KindGuard } from '@sinclair/typebox';
import { describe, test, expect } from 'bun:test';

import { flatten } from '#/modules/schema-builder/utils/flatten';

describe.concurrent('flatten', () => {
	test('should flattens nested unions', () => {
		const schemaNested = t.Union([
			t.String(),
			t.Union([
				t.Number(),
				t.Union([
					t.Boolean(),
					t.Null()
				])
			])
		]);

		const flattened = flatten(schemaNested);
		expect(KindGuard.IsUnion(flattened)).toBe(true);
		expect(flattened.anyOf.length).toBe(4);
		expect(flattened.anyOf).toEqual([
			t.String(),
			t.Number(),
			t.Boolean(),
			t.Null()
		]);
	});

	test('should return the same schema if it is not a union', () => {
		const schema = t.String();
		const flattened = flatten(schema);
		expect(flattened).toBe(schema);
	});

	test('should return an union schema if it is already flat', () => {
		const schema = t.Union([
			t.String(),
			t.Number()
		]);
		const flattened = flatten(schema);
		expect(flattened).toBe(schema);
	});
});
import { Kind, KindGuard } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';
import { t } from 'elysia/type-system';

import { buildSelectedFieldsSchema } from '#/modules/schema-builder/build-selected-fields';

const baseSchema = t.Object({
	id: t.Number(),
	name: t.String(),
	createdAt: t.String({ format: 'date-time' }),
	updatedAt: t.Date()
});

describe.concurrent('buildSelectedFieldsSchema', () => {
	describe.concurrent('schema structure validation', () => {
		test('should create a schema with a good type', () => {
			const selectedFieldsSchema = buildSelectedFieldsSchema(baseSchema);
			expect(KindGuard.IsUnion(selectedFieldsSchema)).toBe(true);
		});

		test('should have an anyOf with three elements', () => {
			const selectedFieldsSchema = buildSelectedFieldsSchema(baseSchema);
			expect(selectedFieldsSchema.anyOf).toBeDefined();
			expect(selectedFieldsSchema.anyOf).toHaveLength(3);
		});
	});

	describe.concurrent('union elements validation', () => {
		describe.concurrent('first element - KeyOf Schema', () => {
			test('should be a union of all schema keys', () => {
				const selectedFieldsSchema = buildSelectedFieldsSchema(baseSchema);
				const [firstElement] = selectedFieldsSchema.anyOf;

				expect(KindGuard.IsUnion(firstElement)).toBe(true);
				expect(firstElement.anyOf).toBeDefined();
				expect(firstElement.anyOf).toHaveLength(Object.keys(baseSchema.properties).length);
			});

			test('should contain all schema keys as literals', () => {
				const selectedFieldsSchema = buildSelectedFieldsSchema(baseSchema);
				const [firstElement] = selectedFieldsSchema.anyOf;

				for (const key of Object.keys(baseSchema.properties))
					expect(firstElement.anyOf).toContainEqual({
						[Kind]: 'Literal',
						const: key,
						type: 'string'
					});
			});
		});

		describe.concurrent('second element - Wildcard', () => {
			test('should be a literal with asterisk value', () => {
				const selectedFieldsSchema = buildSelectedFieldsSchema(baseSchema);
				const [, secondElement] = selectedFieldsSchema.anyOf;

				expect(KindGuard.IsLiteral(secondElement)).toBe(true);
				expect(secondElement.const).toBe('*');
			});
		});

		describe.concurrent('third element - Array of KeyOf Schema', () => {
			test('should be an array with correct structure', () => {
				const selectedFieldsSchema = buildSelectedFieldsSchema(baseSchema);
				const [, , thirdElement] = selectedFieldsSchema.anyOf;

				expect(KindGuard.IsArray(thirdElement)).toBe(true);
				expect(thirdElement.minItems).toBe(1);
				expect(thirdElement.uniqueItems).toBe(true);
				expect(thirdElement.items).toBeDefined();
			});

			test('should have items as union of all schema keys', () => {
				const selectedFieldsSchema = buildSelectedFieldsSchema(baseSchema);
				const [, , thirdElement] = selectedFieldsSchema.anyOf;

				expect(KindGuard.IsUnion(thirdElement.items)).toBe(true);
				expect(thirdElement.items.anyOf).toBeDefined();
				expect(thirdElement.items.anyOf).toHaveLength(Object.keys(baseSchema.properties).length);
			});

			test('should contain all schema keys as literals in items', () => {
				const selectedFieldsSchema = buildSelectedFieldsSchema(baseSchema);
				const [, , thirdElement] = selectedFieldsSchema.anyOf;

				for (const key of Object.keys(baseSchema.properties))
					expect(thirdElement.items.anyOf).toContainEqual({
						[Kind]: 'Literal',
						const: key,
						type: 'string'
					});
			});
		});
	});
});
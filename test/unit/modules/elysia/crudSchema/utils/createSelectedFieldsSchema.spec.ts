import { Kind } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';
import { t } from 'elysia/type-system';

import { createSelectedFieldsSchema } from '#/modules/elysia/crudSchema/utils/createSelectedFieldsSchema';

const baseSchema = t.Object({
	id: t.Number(),
	name: t.String(),
	createdAt: t.String({ format: 'date-time' }),
	updatedAt: t.Date()
});

describe('createSelectedFieldsSchema', () => {
	describe('schema structure validation', () => {
		test('should create a schema with a good type and kind', () => {
			const selectedFieldsSchema = createSelectedFieldsSchema(baseSchema);
			expect(selectedFieldsSchema[Kind]).toBe('Union');
		});

		test('should have an anyOf with three elements', () => {
			const selectedFieldsSchema = createSelectedFieldsSchema(baseSchema);
			expect(selectedFieldsSchema.anyOf).toBeDefined();
			expect(selectedFieldsSchema.anyOf).toHaveLength(3);
		});
	});

	describe('union elements validation', () => {
		describe('first element - KeyOf Schema', () => {
			test('should be a union of all schema keys', () => {
				const selectedFieldsSchema = createSelectedFieldsSchema(baseSchema);
				const [firstElement] = selectedFieldsSchema.anyOf;

				expect(firstElement[Kind]).toBe('Union');
				expect(firstElement.anyOf).toBeDefined();
				expect(firstElement.anyOf).toHaveLength(Object.keys(baseSchema.properties).length);
			});

			test('should contain all schema keys as literals', () => {
				const selectedFieldsSchema = createSelectedFieldsSchema(baseSchema);
				const [firstElement] = selectedFieldsSchema.anyOf;

				for (const key of Object.keys(baseSchema.properties))
					expect(firstElement.anyOf).toContainEqual({
						[Kind]: 'Literal',
						const: key,
						type: 'string'
					});
			});
		});

		describe('second element - Wildcard', () => {
			test('should be a literal with asterisk value', () => {
				const selectedFieldsSchema = createSelectedFieldsSchema(baseSchema);
				const [, secondElement] = selectedFieldsSchema.anyOf;

				expect(secondElement[Kind]).toBe('Literal');
				expect(secondElement.const).toBe('*');
				expect(secondElement.type).toBe('string');
			});
		});

		describe('third element - Array of KeyOf Schema', () => {
			test('should be an array with correct structure', () => {
				const selectedFieldsSchema = createSelectedFieldsSchema(baseSchema);
				const [, , thirdElement] = selectedFieldsSchema.anyOf;

				expect(thirdElement[Kind]).toBe('Array');
				expect(thirdElement.type).toBe('array');
				expect(thirdElement.minItems).toBe(1);
				expect(thirdElement.uniqueItems).toBe(true);
				expect(thirdElement.items).toBeDefined();
			});

			test('should have items as union of all schema keys', () => {
				const selectedFieldsSchema = createSelectedFieldsSchema(baseSchema);
				const [, , thirdElement] = selectedFieldsSchema.anyOf;

				expect(thirdElement.items[Kind]).toBe('Union');
				expect(thirdElement.items.anyOf).toBeDefined();
				expect(thirdElement.items.anyOf).toHaveLength(Object.keys(baseSchema.properties).length);
			});

			test('should contain all schema keys as literals in items', () => {
				const selectedFieldsSchema = createSelectedFieldsSchema(baseSchema);
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
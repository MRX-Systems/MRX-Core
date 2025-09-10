import { Kind } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';
import { t } from 'elysia/type-system';

import { createQSchema } from '#/modules/elysia/crud/utils/create-q-schema';

const baseSchema = t.Object({
	id: t.Number(),
	name: t.String(),
	createdAt: t.String({ format: 'date-time' }),
	updatedAt: t.Date()
});


describe('createQSchema', () => {
	describe('schema structure validation', () => {
		test('should create as schema with a good type and kind', () => {
			const qSchema = createQSchema(baseSchema);
			expect(qSchema[Kind]).toBe('Union');
		});

		test('should have an anyOf with three elements', () => {
			const qSchema = createQSchema(baseSchema);
			expect(qSchema.anyOf).toBeDefined();
			expect(qSchema.anyOf).toHaveLength(3);
		});
	});

	describe('first union element (object with selectedFields and value)', () => {
		test('should be an object with correct structure', () => {
			const qSchema = createQSchema(baseSchema);
			const [firstElement] = qSchema.anyOf;

			expect(firstElement[Kind]).toBe('Object');
			expect(firstElement.type).toBe('object');
			expect(firstElement.properties).toBeDefined();
		});

		test('should have required selectedFields and value properties', () => {
			const qSchema = createQSchema(baseSchema);
			const [firstElement] = qSchema.anyOf;

			expect(firstElement.required).toContain('selectedFields');
			expect(firstElement.required).toContain('value');
		});

		describe('selectedFields property', () => {
			test('should be a union with two options', () => {
				const qSchema = createQSchema(baseSchema);
				const [firstElement] = qSchema.anyOf;
				const { selectedFields } = firstElement.properties;

				expect(selectedFields[Kind]).toBe('Union');
				expect(selectedFields.anyOf).toBeDefined();
				expect(selectedFields.anyOf).toHaveLength(2);
			});

			test('should have first option as union of all schema keys', () => {
				const qSchema = createQSchema(baseSchema);
				const [firstElement] = qSchema.anyOf;
				const { selectedFields } = firstElement.properties;

				expect(selectedFields.anyOf[0][Kind]).toBe('Union');
				expect(selectedFields.anyOf[0].anyOf).toBeDefined();
				expect(selectedFields.anyOf[0].anyOf).toHaveLength(Object.keys(baseSchema.properties).length);

				for (const key of Object.keys(baseSchema.properties))
					expect(selectedFields.anyOf[0].anyOf).toContainEqual({
						[Kind]: 'Literal',
						const: key,
						type: 'string'
					});
			});

			test('should have second option as array of schema keys', () => {
				const qSchema = createQSchema(baseSchema);
				const [firstElement] = qSchema.anyOf;
				const { selectedFields } = firstElement.properties;

				expect(selectedFields.anyOf[1][Kind]).toBe('Array');
				expect(selectedFields.anyOf[1].type).toBe('array');
				expect(selectedFields.anyOf[1].minItems).toBe(1);
				expect(selectedFields.anyOf[1].uniqueItems).toBe(true);
				expect(selectedFields.anyOf[1].items).toBeDefined();
			});

			test('should have array items as union of all schema keys', () => {
				const qSchema = createQSchema(baseSchema);
				const [firstElement] = qSchema.anyOf;
				const { selectedFields } = firstElement.properties;
				const [, arrayOption] = selectedFields.anyOf;

				expect(arrayOption.items[Kind]).toBe('Union');
				expect(arrayOption.items.anyOf).toHaveLength(Object.keys(baseSchema.properties).length);

				for (const key of Object.keys(baseSchema.properties))
					expect(arrayOption.items.anyOf).toContainEqual({
						[Kind]: 'Literal',
						const: key,
						type: 'string'
					});
			});
		});

		describe('value property', () => {
			test('should be a union of number and string', () => {
				const qSchema = createQSchema(baseSchema);
				const [firstElement] = qSchema.anyOf;
				const { value } = firstElement.properties;

				expect(value[Kind]).toBe('Union');
				expect(value.anyOf).toBeDefined();
				expect(value.anyOf).toHaveLength(2);
			});

			test('should have number as first option', () => {
				const qSchema = createQSchema(baseSchema);
				const [firstElement] = qSchema.anyOf;
				const { value } = firstElement.properties;

				expect(value.anyOf[0][Kind]).toBe('Number');
				expect(value.anyOf[0].type).toBe('number');
			});

			test('should have string as second option', () => {
				const qSchema = createQSchema(baseSchema);
				const [firstElement] = qSchema.anyOf;
				const { value } = firstElement.properties;

				expect(value.anyOf[1][Kind]).toBe('String');
				expect(value.anyOf[1].type).toBe('string');
			});
		});
	});

	describe('union elements', () => {
		test('should create second union element as number', () => {
			const qSchema = createQSchema(baseSchema);

			const [, secondElement] = qSchema.anyOf;
			expect(secondElement[Kind]).toBe('Number');
			expect(secondElement.type).toBe('number');
		});

		test('should create third union element as string', () => {
			const qSchema = createQSchema(baseSchema);

			const [, , thirdElement] = qSchema.anyOf;
			expect(thirdElement[Kind]).toBe('String');
			expect(thirdElement.type).toBe('string');
		});
	});
});
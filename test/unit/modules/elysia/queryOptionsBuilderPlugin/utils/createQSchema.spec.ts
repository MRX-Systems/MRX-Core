import { Kind } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';
import { t } from 'elysia/type-system';

import { createQSchema } from '#/modules/elysia/queryOptionsBuilderPlugin/utils/createQSchema';

const baseSchema = t.Object({
	id: t.Number(),
	name: t.String(),
	createdAt: t.String({ format: 'date-time' }),
	updatedAt: t.Date()
});


describe('createQSchema', () => {
	test('should have correct Kind', () => {
		const qSchema = createQSchema(baseSchema);
		expect(qSchema[Kind]).toBe('Union');
	});

	test('should have a anyOf', () => {
		const qSchema = createQSchema(baseSchema);
		expect(qSchema.anyOf).toBeDefined();
		expect(qSchema.anyOf).toHaveLength(3);
	});

	test('should have correct description', () => {
		const qSchema = createQSchema(baseSchema);
		expect(qSchema.description).toBe('Search query that can be a simple string, an object with selected fields and value, or a number.');
	});

	test('should create first union element as object with selectedFields and value', () => {
		const qSchema = createQSchema(baseSchema);

		const [firstElement] = qSchema.anyOf;
		expect(firstElement[Kind]).toBe('Object');
		expect(firstElement.type).toBe('object');
		expect(firstElement.properties).toBeDefined();
		expect(firstElement.required).toContain('selectedFields');
		expect(firstElement.required).toContain('value');

		const { selectedFields, value } = firstElement.properties;

		expect(selectedFields[Kind]).toBe('Union');
		expect(selectedFields.anyOf).toBeDefined();
		expect(selectedFields.anyOf).toHaveLength(2);

		expect(selectedFields.anyOf[0][Kind]).toBe('Union');
		expect(selectedFields.anyOf[0].anyOf).toBeDefined();
		expect(selectedFields.anyOf[0].anyOf).toHaveLength(Object.keys(baseSchema.properties).length);
		for (const key of Object.keys(baseSchema.properties))
			expect(selectedFields.anyOf[0].anyOf).toContainEqual({
				[Kind]: 'Literal',
				const: key,
				type: 'string'
			});

		expect(selectedFields.anyOf[1][Kind]).toBe('Array');
		expect(selectedFields.anyOf[1].type).toBe('array');
		expect(selectedFields.anyOf[1].minItems).toBe(1);
		expect(selectedFields.anyOf[1].uniqueItems).toBe(true);
		expect(selectedFields.anyOf[1].items).toBeDefined();
		expect(selectedFields.anyOf[1].items[Kind]).toBe('Union');
		expect(selectedFields.anyOf[1].items.anyOf).toHaveLength(Object.keys(baseSchema.properties).length);
		for (const key of Object.keys(baseSchema.properties))
			expect(selectedFields.anyOf[1].items.anyOf).toContainEqual({
				[Kind]: 'Literal',
				const: key,
				type: 'string'
			});

		expect(value[Kind]).toBe('Union');
		expect(value.anyOf).toBeDefined();
		expect(value.anyOf).toHaveLength(2);
		expect(value.anyOf[0][Kind]).toBe('Number');
		expect(value.anyOf[0].type).toBe('number');
		expect(value.anyOf[1][Kind]).toBe('String');
		expect(value.anyOf[1].type).toBe('string');
	});

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
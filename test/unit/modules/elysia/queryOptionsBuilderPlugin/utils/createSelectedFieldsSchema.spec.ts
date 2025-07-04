import { Kind } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';
import { t } from 'elysia/type-system';

import { createSelectedFieldsSchema } from '#/modules/elysia/queryOptionsBuilderPlugin/utils/createSelectedFieldsSchema';

const baseSchema = t.Object({
	id: t.Number(),
	name: t.String(),
	createdAt: t.String({ format: 'date-time' }),
	updatedAt: t.Date()
});

describe('createSelectedFieldsSchema', () => {
	test('should have correct Kind', () => {
		const selectedFieldsSchema = createSelectedFieldsSchema(baseSchema);
		expect(selectedFieldsSchema[Kind]).toBe('Union');
	});

	test('should have a anyOf', () => {
		const selectedFieldsSchema = createSelectedFieldsSchema(baseSchema);
		expect(selectedFieldsSchema.anyOf).toBeDefined();
		expect(selectedFieldsSchema.anyOf).toHaveLength(3);
	});

	test('should have correct description', () => {
		const selectedFieldsSchema = createSelectedFieldsSchema(baseSchema);
		expect(selectedFieldsSchema.description).toBe('Selected fields can be a single field, a wildcard "*", or an array of fields and/or wildcard "*".');
	});


	test('should have a good first element (Keyof Schema)', () => {
		const selectedFieldsSchema = createSelectedFieldsSchema(baseSchema);
		const [firstElement] = selectedFieldsSchema.anyOf;
		expect(firstElement[Kind]).toBe('Union');
		expect(firstElement.anyOf).toBeDefined();
		expect(firstElement.anyOf).toHaveLength(Object.keys(baseSchema.properties).length);
		for (const key of Object.keys(baseSchema.properties))
			expect(firstElement.anyOf).toContainEqual({
				[Kind]: 'Literal',
				const: key,
				type: 'string'
			});
	});

	test('should have a good second element (Wildcard)', () => {
		const selectedFieldsSchema = createSelectedFieldsSchema(baseSchema);
		const [, secondElement] = selectedFieldsSchema.anyOf;
		expect(secondElement[Kind]).toBe('Literal');
		expect(secondElement.const).toBe('*');
		expect(secondElement.type).toBe('string');
	});

	test('should have a good third element (Array of Keyof Schema or Wildcard)', () => {
		const selectedFieldsSchema = createSelectedFieldsSchema(baseSchema);
		const [, , thirdElement] = selectedFieldsSchema.anyOf;
		expect(thirdElement[Kind]).toBe('Array');
		expect(thirdElement.type).toBe('array');
		expect(thirdElement.minItems).toBe(1);
		expect(thirdElement.uniqueItems).toBe(true);
		expect(thirdElement.items).toBeDefined();
		expect(thirdElement.items[Kind]).toBe('Union');
		expect(thirdElement.items.anyOf).toBeDefined();
		expect(thirdElement.items.anyOf).toHaveLength(2);


		expect(thirdElement.items.anyOf[0][Kind]).toBe('Union');
		expect(thirdElement.items.anyOf[0].anyOf).toBeDefined();
		expect(thirdElement.items.anyOf[0].anyOf).toHaveLength(Object.keys(baseSchema.properties).length);
		for (const key of Object.keys(baseSchema.properties))
			expect(thirdElement.items.anyOf[0].anyOf).toContainEqual({
				[Kind]: 'Literal',
				const: key,
				type: 'string'
			});

		expect(thirdElement.items.anyOf[1][Kind]).toBe('Literal');
		expect(thirdElement.items.anyOf[1].const).toBe('*');
		expect(thirdElement.items.anyOf[1].type).toBe('string');
	});
});
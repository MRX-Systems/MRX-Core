import { Kind } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';
import { t } from 'elysia/type-system';

import { createOrderSchema } from '#/modules/elysia/crud-schema/utils/create-order-schema';

const baseSchema = t.Object({
	id: t.Number(),
	name: t.String(),
	createdAt: t.String({ format: 'date-time' }),
	updatedAt: t.Date()
});


describe('createOrderSchema', () => {
	test('should create a schema with a good type and kind', () => {
		const orderBySchema = createOrderSchema(baseSchema);
		expect(orderBySchema[Kind]).toBe('Union');
	});

	test('should have an anyOf with two elements', () => {
		const orderBySchema = createOrderSchema(baseSchema);
		expect(orderBySchema.anyOf).toBeDefined();
		expect(orderBySchema.anyOf).toHaveLength(2);
	});

	test('first element should be an object with correct type and kind', () => {
		const orderBySchema = createOrderSchema(baseSchema);
		const [firstElement] = orderBySchema.anyOf;

		expect(firstElement[Kind]).toBe('Object');
		expect(firstElement.type).toBe('object');
	});

	test('first element should have required selectedField and direction properties', () => {
		const orderBySchema = createOrderSchema(baseSchema);
		const [firstElement] = orderBySchema.anyOf;

		expect(firstElement.required).toContain('selectedField');
		expect(firstElement.required).toContain('direction');
		expect(firstElement.properties).toBeDefined();
	});

	test('first element selectedField should be a union with all base schema keys', () => {
		const orderBySchema = createOrderSchema(baseSchema);
		const [firstElement] = orderBySchema.anyOf;
		const { selectedField } = firstElement.properties;

		expect(selectedField[Kind]).toBe('Union');
		expect(selectedField.anyOf).toBeDefined();
		expect(selectedField.anyOf).toHaveLength(Object.keys(baseSchema.properties).length);

		for (const key of Object.keys(baseSchema.properties))
			expect(selectedField.anyOf).toContainEqual({
				[Kind]: 'Literal',
				const: key,
				type: 'string'
			});
	});

	test('first element direction should be a union with asc and desc values', () => {
		const orderBySchema = createOrderSchema(baseSchema);
		const [firstElement] = orderBySchema.anyOf;
		const { direction } = firstElement.properties;

		expect(direction[Kind]).toBe('Union');
		expect(direction.anyOf).toBeDefined();
		expect(direction.anyOf).toHaveLength(2);
		expect(direction.anyOf).toContainEqual({
			[Kind]: 'Literal',
			const: 'asc',
			type: 'string'
		});
		expect(direction.anyOf).toContainEqual({
			[Kind]: 'Literal',
			const: 'desc',
			type: 'string'
		});
	});

	test('should first element items is required', () => {
		const orderBySchema = createOrderSchema(baseSchema);
		const [firstElement] = orderBySchema.anyOf;

		expect(firstElement.required).toContain('selectedField');
		expect(firstElement.required).toContain('direction');
	});

	test('second element should be an array with correct type, kind and constraints', () => {
		const orderBySchema = createOrderSchema(baseSchema);
		const [, secondElement] = orderBySchema.anyOf;

		expect(secondElement[Kind]).toBe('Array');
		expect(secondElement.type).toBe('array');
		expect(secondElement.minItems).toBe(1);
		expect(secondElement.uniqueItems).toBe(true);
		expect(secondElement.items).toBeDefined();
	});

	test('second element items should be objects with correct type and kind', () => {
		const orderBySchema = createOrderSchema(baseSchema);
		const [, secondElement] = orderBySchema.anyOf;

		expect(secondElement.items[Kind]).toBe('Object');
		expect(secondElement.items.type).toBe('object');
	});

	test('second element items should have required selectedField and direction properties', () => {
		const orderBySchema = createOrderSchema(baseSchema);
		const [, secondElement] = orderBySchema.anyOf;

		expect(secondElement.items.required).toContain('selectedField');
		expect(secondElement.items.required).toContain('direction');
		expect(secondElement.items.properties).toBeDefined();
	});

	test('second element items selectedField should be a union with all base schema keys', () => {
		const orderBySchema = createOrderSchema(baseSchema);
		const [, secondElement] = orderBySchema.anyOf;
		const { selectedField } = secondElement.items.properties;

		expect(selectedField[Kind]).toBe('Union');
		expect(selectedField.anyOf).toBeDefined();
		expect(selectedField.anyOf).toHaveLength(Object.keys(baseSchema.properties).length);

		for (const key of Object.keys(baseSchema.properties))
			expect(selectedField.anyOf).toContainEqual({
				[Kind]: 'Literal',
				const: key,
				type: 'string'
			});
	});

	test('second element items direction should be a union with asc and desc values', () => {
		const orderBySchema = createOrderSchema(baseSchema);
		const [, secondElement] = orderBySchema.anyOf;
		const { direction } = secondElement.items.properties;

		expect(direction[Kind]).toBe('Union');
		expect(direction.anyOf).toBeDefined();
		expect(direction.anyOf).toHaveLength(2);
		expect(direction.anyOf).toContainEqual({
			[Kind]: 'Literal',
			const: 'asc',
			type: 'string'
		});
		expect(direction.anyOf).toContainEqual({
			[Kind]: 'Literal',
			const: 'desc',
			type: 'string'
		});
	});

	test('should second element need minItems and uniqueItems', () => {
		const orderBySchema = createOrderSchema(baseSchema);
		const [, secondElement] = orderBySchema.anyOf;

		expect(secondElement.minItems).toBe(1);
		expect(secondElement.uniqueItems).toBe(true);
	});
});
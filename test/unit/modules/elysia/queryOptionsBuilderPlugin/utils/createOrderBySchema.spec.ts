import { Kind } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';
import { t } from 'elysia/type-system';

import { createOrderBySchema } from '#/modules/elysia/queryOptionsBuilderPlugin/utils/createOrderBySchema';

const baseSchema = t.Object({
    id: t.Number(),
    name: t.String(),
    createdAt: t.String({ format: 'date-time' }),
    updatedAt: t.Date()
});


describe('createOrderBySchema', () => {
    test('should have correct Kind', () => {
        const orderBySchema = createOrderBySchema(baseSchema);
        expect(orderBySchema[Kind]).toBe('Union');
    });

    test('should have a anyOf', () => {
        const orderBySchema = createOrderBySchema(baseSchema);
        expect(orderBySchema.anyOf).toBeDefined();
        expect(orderBySchema.anyOf).toHaveLength(2);
    });

    test('should have correct description', () => {
        const orderBySchema = createOrderBySchema(baseSchema);
        expect(orderBySchema.description).toBe('Order by is an item or array of items with a field to order by and direction. Use "asc" for ascending or "desc" for descending order.');
    });

    test('should have a good first element (Object with selectedField and direction)', () => {
        const orderBySchema = createOrderBySchema(baseSchema);
        const [firstElement] = orderBySchema.anyOf;
        expect(firstElement[Kind]).toBe('Object');
        expect(firstElement.type).toBe('object');
        expect(firstElement.required).toContain('selectedField');
        expect(firstElement.required).toContain('direction');
        expect(firstElement.properties).toBeDefined();

        const { selectedField, direction } = firstElement.properties;
        expect(selectedField[Kind]).toBe('Union');
        expect(selectedField.anyOf).toBeDefined();
        expect(selectedField.anyOf).toHaveLength(Object.keys(baseSchema.properties).length);
        for (const key of Object.keys(baseSchema.properties))
            expect(selectedField.anyOf).toContainEqual({
                [Kind]: 'Literal',
                const: key,
                type: 'string'
            });

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

    test('should have a good second element (Array of Object with selectedField and direction)', () => {
        const orderBySchema = createOrderBySchema(baseSchema);
        const [, secondElement] = orderBySchema.anyOf;
        expect(secondElement[Kind]).toBe('Array');
        expect(secondElement.type).toBe('array');
        expect(secondElement.minItems).toBe(1);
        expect(secondElement.items).toBeDefined();
        expect(secondElement.items[Kind]).toBe('Object');
        expect(secondElement.items.type).toBe('object');
        expect(secondElement.items.required).toContain('selectedField');
        expect(secondElement.items.required).toContain('direction');
        expect(secondElement.items.properties).toBeDefined();

        const { selectedField, direction } = secondElement.items.properties;
        expect(selectedField[Kind]).toBe('Union');
        expect(selectedField.anyOf).toBeDefined();
        expect(selectedField.anyOf).toHaveLength(Object.keys(baseSchema.properties).length);
        for (const key of Object.keys(baseSchema.properties))
            expect(selectedField.anyOf).toContainEqual({
                [Kind]: 'Literal',
                const: key,
                type: 'string'
            });

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
});
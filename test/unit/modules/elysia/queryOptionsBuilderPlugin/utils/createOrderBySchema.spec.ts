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
    test('should create a tuple schema with correct basic structure', () => {
        const orderBySchema = createOrderBySchema(baseSchema);

        expect(orderBySchema[Kind]).toBe('Tuple');
        expect(orderBySchema.type).toBe('array');
        expect(orderBySchema.minItems).toBe(2);
        expect(orderBySchema.maxItems).toBe(2);
        expect(orderBySchema.items).toHaveLength(2);
    });

    test('should have correct description', () => {
        const orderBySchema = createOrderBySchema(baseSchema);
        expect(orderBySchema.description).toBe('Field to order by and direction. Use "asc" for ascending or "desc" for descending order.');
    });

    test('should create first tuple element as union of schema property keys', () => {
        const orderBySchema = createOrderBySchema(baseSchema);

        if (!orderBySchema.items)
            throw new Error('Expected orderBySchema.items to be defined');

        const [firstElement] = orderBySchema.items;
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

    test('should create second tuple element as union of asc and desc literals', () => {
        const orderBySchema = createOrderBySchema(baseSchema);

        if (!orderBySchema.items)
            throw new Error('Expected orderBySchema.items to be defined');

        const [, secondElement] = orderBySchema.items;
        expect(secondElement[Kind]).toBe('Union');
        expect(secondElement.anyOf).toBeDefined();
        expect(secondElement.anyOf).toHaveLength(2);
        expect(secondElement.anyOf).toContainEqual({
            [Kind]: 'Literal',
            const: 'asc',
            type: 'string'
        });
        expect(secondElement.anyOf).toContainEqual({
            [Kind]: 'Literal',
            const: 'desc',
            type: 'string'
        });
    });
});
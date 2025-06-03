import { Kind } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';
import { t } from 'elysia/type-system';

import { createOrderBySchema } from '#/utils/typebox/createOrderBySchema';

const baseSchema = t.Object({
    id: t.Number(),
    name: t.String(),
    createdAt: t.String({ format: 'date-time' }),
    updatedAt: t.Date()
});


describe('createOrderBySchema', () => {
    test('should have a correct structure for order by schema', () => {
        const orderBySchema = createOrderBySchema(baseSchema);
        expect(orderBySchema[Kind]).toBe('Tuple');
        expect(orderBySchema.type).toBe('array');
        expect(orderBySchema.minItems).toBe(2);
        expect(orderBySchema.maxItems).toBe(2);
        expect(orderBySchema.items).toHaveLength(2);
        expect(orderBySchema.description).toBe('Field to order by and direction. Use "asc" for ascending or "desc" for descending order.');
        expect(orderBySchema.examples).toHaveLength(2);
        expect(orderBySchema.examples[0]).toEqual(['id', 'asc']);
        expect(orderBySchema.examples[1]).toEqual(['name', 'desc']);

        // Check keyof type
        if (orderBySchema.items) {
            expect(orderBySchema.items[0][Kind]).toBe('Union');

            expect(orderBySchema.items[0].anyOf).toBeDefined();
            expect(orderBySchema.items[0].anyOf).toHaveLength(Object.keys(baseSchema.properties).length);
            for (const key of Object.keys(baseSchema.properties))
                expect(orderBySchema.items[0].anyOf).toContainEqual({
                    [Kind]: 'Literal',
                    const: key,
                    type: 'string'
                });


            // check union literal type asc | desc
            expect(orderBySchema.items[1][Kind]).toBe('Union');
            expect(orderBySchema.items[1].anyOf).toBeDefined();
            expect(orderBySchema.items[1].anyOf).toHaveLength(2);
            expect(orderBySchema.items[1].anyOf).toContainEqual({
                [Kind]: 'Literal',
                const: 'asc',
                type: 'string'
            });
            expect(orderBySchema.items[1].anyOf).toContainEqual({
                [Kind]: 'Literal',
                const: 'desc',
                type: 'string'
            });
        }
    });
});
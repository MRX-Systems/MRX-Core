import { Kind } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';
import { t } from 'elysia/type-system';

import { createQSchema } from '#/utils/typebox/createQSchema';

const baseSchema = t.Object({
    id: t.Number(),
    name: t.String(),
    createdAt: t.String({ format: 'date-time' }),
    updatedAt: t.Date()
});


describe('createQSchema', () => {
    test('should have a correct structure for query schema', () => {
        const qSchema = createQSchema(baseSchema);
        expect(qSchema[Kind]).toBe('Union');
        expect(qSchema.anyOf).toBeDefined();
        expect(qSchema.anyOf).toHaveLength(4);
        expect(qSchema.description).toBe('Search query that can be a simple string, an object with selected fields and value, or a number.');
        expect(qSchema.examples).toHaveLength(3);
        expect(qSchema.examples[0]).toBe('search term');
        expect(qSchema.examples[1]).toEqual({ selectedFields: [Object.keys(baseSchema.properties)], value: 'search term' });
        expect(qSchema.examples[2]).toBe(42);

        // Check each variant of the union
        expect(qSchema.anyOf[0][Kind]).toBe('Undefined');
        expect(qSchema.anyOf[0].type).toBe('undefined');

        expect(qSchema.anyOf[1][Kind]).toBe('Object');
        expect(qSchema.anyOf[1].type).toBe('object');

        expect(qSchema.anyOf[1].required).toBeDefined();
        expect(qSchema.anyOf[1].required).toHaveLength(2);
        expect(qSchema.anyOf[1].required).toContain('selectedFields');
        expect(qSchema.anyOf[1].required).toContain('value');

        expect(qSchema.anyOf[1].properties).toHaveProperty('selectedFields');
        expect(qSchema.anyOf[1].properties).toHaveProperty('value');

        expect(qSchema.anyOf[1].properties.selectedFields[Kind]).toBe('Array');
        expect(qSchema.anyOf[1].properties.selectedFields.type).toBe('array');
        expect(qSchema.anyOf[1].properties.selectedFields.description).toBe('Fields to select in the search results. Use "*" for all fields.');
        expect(qSchema.anyOf[1].properties.selectedFields.minItems).toBe(1);
        expect(qSchema.anyOf[1].properties.selectedFields.items).toBeDefined();
        expect(qSchema.anyOf[1].properties.selectedFields.items[Kind]).toBe('Union');
        expect(qSchema.anyOf[1].properties.selectedFields.items.anyOf).toBeDefined();
        expect(qSchema.anyOf[1].properties.selectedFields.items.anyOf).toHaveLength(2);
        expect(qSchema.anyOf[1].properties.selectedFields.items.anyOf[0][Kind]).toBe('Union');
        expect(qSchema.anyOf[1].properties.selectedFields.items.anyOf[0].anyOf).toBeDefined();
        expect(qSchema.anyOf[1].properties.selectedFields.items.anyOf[0].anyOf).toHaveLength(Object.keys(baseSchema.properties).length);
        for (const key of Object.keys(baseSchema.properties))
            expect(qSchema.anyOf[1].properties.selectedFields.items.anyOf[0].anyOf).toContainEqual({
                [Kind]: 'Literal',
                const: key,
                type: 'string'
            });
        expect(qSchema.anyOf[1].properties.selectedFields.items.anyOf[1][Kind]).toBe('Literal');
        expect(qSchema.anyOf[1].properties.selectedFields.items.anyOf[1].const).toBe('*');
        expect(qSchema.anyOf[1].properties.selectedFields.items.anyOf[1].type).toBe('string');

        expect(qSchema.anyOf[2][Kind]).toBe('Number');
        expect(qSchema.anyOf[2].type).toBe('number');

        expect(qSchema.anyOf[3][Kind]).toBe('String');
        expect(qSchema.anyOf[3].type).toBe('string');
    });
});
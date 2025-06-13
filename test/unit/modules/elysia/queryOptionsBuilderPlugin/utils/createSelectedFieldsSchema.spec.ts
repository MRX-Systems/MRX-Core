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


    test('should have a good anyOf structure', () => {
        const selectedFieldsSchema = createSelectedFieldsSchema(baseSchema);
        expect(selectedFieldsSchema.anyOf).toBeDefined();
        expect(selectedFieldsSchema.anyOf).toHaveLength(3);

        expect(selectedFieldsSchema.anyOf[0][Kind]).toBe('Union');
        expect(selectedFieldsSchema.anyOf[0].anyOf).toBeDefined();
        expect(selectedFieldsSchema.anyOf[0].anyOf).toHaveLength(Object.keys(baseSchema.properties).length);
        for (const key of Object.keys(baseSchema.properties))
            expect(selectedFieldsSchema.anyOf[0].anyOf).toContainEqual({
                [Kind]: 'Literal',
                const: key,
                type: 'string'
            });

        expect(selectedFieldsSchema.anyOf[1][Kind]).toBe('Literal');
        expect(selectedFieldsSchema.anyOf[1].const).toBe('*');
        expect(selectedFieldsSchema.anyOf[1].type).toBe('string');

        expect(selectedFieldsSchema.anyOf[2][Kind]).toBe('Array');
        expect(selectedFieldsSchema.anyOf[2].type).toBe('array');
        expect(selectedFieldsSchema.anyOf[2].minItems).toBe(1);

        expect(selectedFieldsSchema.anyOf[2].items).toBeDefined();
        expect(selectedFieldsSchema.anyOf[2].items[Kind]).toBe('Union');
        expect(selectedFieldsSchema.anyOf[2].items.anyOf).toBeDefined();
        expect(selectedFieldsSchema.anyOf[2].items.anyOf).toHaveLength(2);
        expect(selectedFieldsSchema.anyOf[2].items.anyOf[0][Kind]).toBe('Union');
        expect(selectedFieldsSchema.anyOf[2].items.anyOf[0].anyOf).toBeDefined();
        expect(selectedFieldsSchema.anyOf[2].items.anyOf[0].anyOf).toHaveLength(Object.keys(baseSchema.properties).length);
        for (const key of Object.keys(baseSchema.properties))
            expect(selectedFieldsSchema.anyOf[2].items.anyOf[0].anyOf).toContainEqual({
                [Kind]: 'Literal',
                const: key,
                type: 'string'
            });
        expect(selectedFieldsSchema.anyOf[2].items.anyOf[1][Kind]).toBe('Literal');
        expect(selectedFieldsSchema.anyOf[2].items.anyOf[1].const).toBe('*');
        expect(selectedFieldsSchema.anyOf[2].items.anyOf[1].type).toBe('string');
    });

    test('should have correct default value and description', () => {
        const selectedFieldsSchema = createSelectedFieldsSchema(baseSchema);

        expect(selectedFieldsSchema.default).toEqual(['*']);
        expect(selectedFieldsSchema.description).toBe('Fields to select in the search results. Use "*" for all fields.');
    });
});
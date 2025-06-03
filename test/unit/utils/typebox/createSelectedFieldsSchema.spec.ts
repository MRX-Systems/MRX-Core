import { Kind } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';
import { t } from 'elysia/type-system';

import { createSelectedFieldsSchema } from '#/utils/typebox/createSelectedFieldsSchema';

const baseSchema = t.Object({
    id: t.Number(),
    name: t.String(),
    createdAt: t.String({ format: 'date-time' }),
    updatedAt: t.Date()
});

describe('createSelectedFieldsSchema', () => {
    test('should have a correct structure for selected fields schema', () => {
        const selectedFieldsSchema = createSelectedFieldsSchema(baseSchema);

        expect(selectedFieldsSchema[Kind]).toBe('Array');
        expect(selectedFieldsSchema.type).toBe('array');
        expect(selectedFieldsSchema.default).toEqual(['*']);

        expect(selectedFieldsSchema.items[Kind]).toBe('Union');
        expect(selectedFieldsSchema.items.anyOf).toBeDefined();
        expect(selectedFieldsSchema.items.anyOf).toHaveLength(2);

        // check KeyOf type
        expect(selectedFieldsSchema.items.anyOf[0][Kind]).toBe('Union');
        expect(selectedFieldsSchema.items.anyOf[0].anyOf).toBeDefined();
        expect(selectedFieldsSchema.items.anyOf[0].anyOf).toHaveLength(Object.keys(baseSchema.properties).length);

        for (const key of Object.keys(baseSchema.properties))
            expect(selectedFieldsSchema.items.anyOf[0].anyOf).toContainEqual({
                [Kind]: 'Literal',
                const: key,
                type: 'string'
            });

        // check literal type
        expect(selectedFieldsSchema.items.anyOf[1][Kind]).toBe('Literal');
        expect(selectedFieldsSchema.items.anyOf[1].const).toBe('*');
    });

    test('should allow selecting all fields with "*" literal', () => {
        const selectedFieldsSchema = createSelectedFieldsSchema(baseSchema);
        expect(selectedFieldsSchema.items.anyOf).toContainEqual({
            [Kind]: 'Literal',
            const: '*',
            type: 'string'
        });
    });

    test('should have a minimum of one item in the array', () => {
        const selectedFieldsSchema = createSelectedFieldsSchema(baseSchema);
        expect(selectedFieldsSchema.minItems).toBe(1);
    });

    test('should have a default value of ["*"]', () => {
        const selectedFieldsSchema = createSelectedFieldsSchema(baseSchema);
        expect(selectedFieldsSchema.default).toEqual(['*']);
    });
});
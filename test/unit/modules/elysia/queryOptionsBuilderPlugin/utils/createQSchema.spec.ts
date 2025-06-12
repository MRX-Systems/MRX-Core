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

    test('should have a good anyOf structure', () => {
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
        expect(firstElement.properties).toBeDefined();
        expect(firstElement.required).toContain('selectedFields');
        expect(firstElement.required).toContain('value');

        const { selectedFields, value } = firstElement.properties;
        expect(selectedFields.minItems).toBe(1);
        expect(selectedFields.type).toBe('array');
        expect(selectedFields.items).toBeDefined();
        expect(selectedFields.items[Kind]).toBe('Union');
        expect(selectedFields.items.anyOf).toBeDefined();
        expect(selectedFields.items.anyOf).toHaveLength(2);


        expect(selectedFields.items.anyOf[0][Kind]).toBe('Union');
        expect(selectedFields.items.anyOf[0].anyOf).toBeDefined();
        expect(selectedFields.items.anyOf[0].anyOf).toHaveLength(Object.keys(baseSchema.properties).length);
        for (const key of Object.keys(baseSchema.properties))
            expect(selectedFields.items.anyOf[0].anyOf).toContainEqual({
                [Kind]: 'Literal',
                const: key,
                type: 'string'
            });

        expect(selectedFields.items.anyOf[1]).toBeDefined();
        expect(selectedFields.items.anyOf[1].const).toBe('*');
        expect(selectedFields.items.anyOf[1][Kind]).toBe('Literal');
        expect(selectedFields.items.anyOf[1].type).toBe('string');

        expect(selectedFields[Kind]).toBe('Array');

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
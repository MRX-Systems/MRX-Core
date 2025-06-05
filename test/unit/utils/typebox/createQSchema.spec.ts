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
    test('should create a union schema with correct basic structure', () => {
        const qSchema = createQSchema(baseSchema);

        expect(qSchema[Kind]).toBe('Union');
        expect(qSchema.anyOf).toBeDefined();
        expect(qSchema.anyOf).toHaveLength(4);
    });

    test('should have correct description and examples', () => {
        const qSchema = createQSchema(baseSchema);

        expect(qSchema.description).toBe('Search query that can be a simple string, an object with selected fields and value, or a number.');
        expect(qSchema.examples).toHaveLength(3);
        expect(qSchema.examples[0]).toBe('search term');
        expect(qSchema.examples[1]).toEqual({ selectedFields: [Object.keys(baseSchema.properties)], value: 'search term' });
        expect(qSchema.examples[2]).toBe(42);
    });

    test('should include undefined as first union option', () => {
        const qSchema = createQSchema(baseSchema);

        const [undefinedOption] = qSchema.anyOf;
        expect(undefinedOption[Kind]).toBe('Undefined');
        expect(undefinedOption.type).toBe('undefined');
    });

    test('should include object with selectedFields and value as second union option', () => {
        const qSchema = createQSchema(baseSchema);

        const [, objectOption] = qSchema.anyOf;
        expect(objectOption[Kind]).toBe('Object');
        expect(objectOption.type).toBe('object');
        expect(objectOption.required).toBeDefined();
        expect(objectOption.required).toHaveLength(2);
        expect(objectOption.required).toContain('selectedFields');
        expect(objectOption.required).toContain('value');
        expect(objectOption.properties).toHaveProperty('selectedFields');
        expect(objectOption.properties).toHaveProperty('value');
    });

    test('should have correct selectedFields structure in object option', () => {
        const qSchema = createQSchema(baseSchema);

        const [, objectOption] = qSchema.anyOf;
        const { selectedFields } = objectOption.properties;

        expect(selectedFields[Kind]).toBe('Array');
        expect(selectedFields.type).toBe('array');
        expect(selectedFields.description).toBe('Fields to select in the search results. Use "*" for all fields.');
        expect(selectedFields.minItems).toBe(1);
        expect(selectedFields.items).toBeDefined();
    });

    test('should have selectedFields items as union of schema keys and wildcard', () => {
        const qSchema = createQSchema(baseSchema);

        const [, objectOption] = qSchema.anyOf;
        const { selectedFields } = objectOption.properties;

        expect(selectedFields.items[Kind]).toBe('Union');
        expect(selectedFields.items.anyOf).toBeDefined();
        expect(selectedFields.items.anyOf).toHaveLength(2);

        // Check schema keys union
        const [schemaKeysUnion] = selectedFields.items.anyOf;
        expect(schemaKeysUnion[Kind]).toBe('Union');
        expect(schemaKeysUnion.anyOf).toBeDefined();
        expect(schemaKeysUnion.anyOf).toHaveLength(Object.keys(baseSchema.properties).length);

        for (const key of Object.keys(baseSchema.properties))
            expect(schemaKeysUnion.anyOf).toContainEqual({
                [Kind]: 'Literal',
                const: key,
                type: 'string'
            });

        // Check wildcard literal
        const [, wildcardLiteral] = selectedFields.items.anyOf;
        expect(wildcardLiteral[Kind]).toBe('Literal');
        expect(wildcardLiteral.const).toBe('*');
        expect(wildcardLiteral.type).toBe('string');
    });

    test('should include number as third union option', () => {
        const qSchema = createQSchema(baseSchema);

        const [,, numberOption] = qSchema.anyOf;
        expect(numberOption[Kind]).toBe('Number');
        expect(numberOption.type).toBe('number');
    });

    test('should include string as fourth union option', () => {
        const qSchema = createQSchema(baseSchema);

        const [,,, stringOption] = qSchema.anyOf;
        expect(stringOption[Kind]).toBe('String');
        expect(stringOption.type).toBe('string');
    });
});
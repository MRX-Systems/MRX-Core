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
    test('should create an array schema with correct basic structure', () => {
        const selectedFieldsSchema = createSelectedFieldsSchema(baseSchema);

        expect(selectedFieldsSchema[Kind]).toBe('Array');
        expect(selectedFieldsSchema.type).toBe('array');
        expect(selectedFieldsSchema.minItems).toBe(1);
    });

    test('should have correct default value and description', () => {
        const selectedFieldsSchema = createSelectedFieldsSchema(baseSchema);

        expect(selectedFieldsSchema.default).toEqual(['*']);
        expect(selectedFieldsSchema.description).toBe('Fields to select in the search results. Use "*" for all fields.');
    });

    test('should have correct examples', () => {
        const selectedFieldsSchema = createSelectedFieldsSchema(baseSchema);

        expect(selectedFieldsSchema.examples).toHaveLength(2);
        expect(selectedFieldsSchema.examples[0]).toEqual(Object.keys(baseSchema.properties));
        expect(selectedFieldsSchema.examples[1]).toEqual(['*']);
    });

    test('should create items as union of schema keys and wildcard', () => {
        const selectedFieldsSchema = createSelectedFieldsSchema(baseSchema);

        expect(selectedFieldsSchema.items[Kind]).toBe('Union');
        expect(selectedFieldsSchema.items.anyOf).toBeDefined();
        expect(selectedFieldsSchema.items.anyOf).toHaveLength(2);
    });

    test('should include all schema property keys as union options', () => {
        const selectedFieldsSchema = createSelectedFieldsSchema(baseSchema);

        const [schemaKeysUnion] = selectedFieldsSchema.items.anyOf;
        expect(schemaKeysUnion[Kind]).toBe('Union');
        expect(schemaKeysUnion.anyOf).toBeDefined();
        expect(schemaKeysUnion.anyOf).toHaveLength(Object.keys(baseSchema.properties).length);

        for (const key of Object.keys(baseSchema.properties))
            expect(schemaKeysUnion.anyOf).toContainEqual({
                [Kind]: 'Literal',
                const: key,
                type: 'string'
            });
    });

    test('should include wildcard "*" as literal option', () => {
        const selectedFieldsSchema = createSelectedFieldsSchema(baseSchema);

        const [, wildcardLiteral] = selectedFieldsSchema.items.anyOf;
        expect(wildcardLiteral[Kind]).toBe('Literal');
        expect(wildcardLiteral.const).toBe('*');
        expect(wildcardLiteral.type).toBe('string');
    });
});
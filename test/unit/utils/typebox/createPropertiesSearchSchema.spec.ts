import { Kind, type TSchema, OptionalKind } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';
import { t } from 'elysia/type-system';

import { createPropertiesSearchSchema } from '#/utils/typebox/createPropertiesSearchSchema';

const baseSchema = t.Object({
    id: t.Number(),
    name: t.String(),
    isActive: t.Boolean(),
    createdAt: t.String({ format: 'date-time' }),
    country: t.Integer(),
    updatedAt: t.Date()
});

/**
 * Helper function to check basic operators ($eq, $neq, $isNull) for any type
 */
const _checkBasicOperators = (
    schema: Record<string, TSchema>,
    referenceType: string,
    referenceKind: string
): void => {
    expect(schema).toHaveProperty('$eq');

    // check si type existe sur les union pour la date
    expect(schema['$eq'].type).toBe(referenceType);
    expect(schema['$eq'].description).toBe(`Equal to the specified value of type ${referenceType}`);
    expect(schema['$eq'].examples).toHaveLength(0);
    expect(schema['$eq'].example).toBeUndefined();
    expect(schema['$eq'][Kind]).toBe(referenceKind);
    expect(schema['$eq'][OptionalKind]).toBe('Optional');

    expect(schema).toHaveProperty('$neq');
    expect(schema['$neq'].type).toBe(referenceType);
    expect(schema['$neq'].description).toBe(`Not equal to the specified value of type ${referenceType}`);
    expect(schema['$neq'].examples).toHaveLength(0);
    expect(schema['$neq'].example).toBeUndefined();
    expect(schema['$neq'][Kind]).toBe(referenceKind);
    expect(schema['$neq'][OptionalKind]).toBe('Optional');

    expect(schema).toHaveProperty('$isNull');
    expect(schema['$isNull'].type).toBe('boolean');
    expect(schema['$isNull'].description).toBe('Check if the value is null');
    expect(schema['$isNull'].examples).toEqual([true, false]);
    expect(schema['$isNull'].example).toBeUndefined();
    expect(schema['$isNull'][Kind]).toBe('Boolean');
    expect(schema['$isNull'][OptionalKind]).toBe('Optional');
};

/**
 * Helper function to check array and pattern operators ($in, $nin, $like, $nlike) for string, number, and date types
 */
const _checkArrayAndPatternOperators = (
    schema: Record<string, TSchema>,
    referenceType: string,
    referenceKind: string
): void => {
    expect(schema).toHaveProperty('$in');
    expect(schema['$in'].description).toBe(`Array of values to match against the value of type ${referenceType}`);
    expect(schema['$in'].minItems).toBe(1);
    expect(schema['$in'].uniqueItems).toBe(true);
    expect(schema['$in'].type).toBe('array');
    expect(schema['$in'].items).toBeDefined();
    expect(schema['$in'].items.type).toBe(referenceType);
    expect(schema['$in'].items[Kind]).toBe(referenceKind);
    expect(schema['$in'][Kind]).toBe('Array');
    expect(schema['$in'][OptionalKind]).toBe('Optional');

    expect(schema).toHaveProperty('$nin');
    expect(schema['$nin'].description).toBe(`Array of values to exclude from matching the value of type ${referenceType}`);
    expect(schema['$nin'].minItems).toBe(1);
    expect(schema['$nin'].uniqueItems).toBe(true);
    expect(schema['$nin'].type).toBe('array');
    expect(schema['$nin'].items).toBeDefined();
    expect(schema['$nin'].items.type).toBe(referenceType);
    expect(schema['$nin'].items[Kind]).toBe(referenceKind);
    expect(schema['$nin'][Kind]).toBe('Array');
    expect(schema['$nin'][OptionalKind]).toBe('Optional');

    expect(schema).toHaveProperty('$like');
    expect(schema['$like'].description).toBe(`Pattern to match against the string value of type ${referenceType}. Supports SQL-like wildcards (%)`);
    expect(schema['$like'].type).toBe('string');
    expect(schema['$like'][Kind]).toBe('String');
    expect(schema['$like'][OptionalKind]).toBe('Optional');

    expect(schema).toHaveProperty('$nlike');
    expect(schema['$nlike'].description).toBe(`Pattern to exclude from matching the string value of type ${referenceType}. Supports SQL-like wildcards (%)`);
    expect(schema['$nlike'].type).toBe('string');
    expect(schema['$nlike'][Kind]).toBe('String');
    expect(schema['$nlike'][OptionalKind]).toBe('Optional');
};

/**
 * Helper function to check comparison operators ($lt, $lte, $gt, $gte, $between, $nbetween) for number and date types
 */
const _checkComparisonOperators = (
    schema: Record<string, TSchema>,
    referenceType: string,
    referenceKind: string
): void => {
    expect(schema).toHaveProperty('$lt');
    expect(schema['$lt'].type).toBe(referenceType);
    expect(schema['$lt'].description).toBe(`Less than the specified value of type ${referenceType}`);
    expect(schema['$lt'].examples).toHaveLength(0);
    expect(schema['$lt'].example).toBeUndefined();
    expect(schema['$lt'][Kind]).toBe(referenceKind);
    expect(schema['$lt'][OptionalKind]).toBe('Optional');

    expect(schema).toHaveProperty('$lte');
    expect(schema['$lte'].type).toBe(referenceType);
    expect(schema['$lte'].description).toBe(`Less than or equal to the specified value of type ${referenceType}`);
    expect(schema['$lte'].examples).toHaveLength(0);
    expect(schema['$lte'].example).toBeUndefined();
    expect(schema['$lte'][Kind]).toBe(referenceKind);
    expect(schema['$lte'][OptionalKind]).toBe('Optional');

    expect(schema).toHaveProperty('$gt');
    expect(schema['$gt'].type).toBe(referenceType);
    expect(schema['$gt'].description).toBe(`Greater than the specified value of type ${referenceType}`);
    expect(schema['$gt'].examples).toHaveLength(0);
    expect(schema['$gt'].example).toBeUndefined();
    expect(schema['$gt'][Kind]).toBe(referenceKind);
    expect(schema['$gt'][OptionalKind]).toBe('Optional');

    expect(schema).toHaveProperty('$gte');
    expect(schema['$gte'].type).toBe(referenceType);
    expect(schema['$gte'].description).toBe(`Greater than or equal to the specified value of type ${referenceType}`);
    expect(schema['$gte'].examples).toHaveLength(0);
    expect(schema['$gte'].example).toBeUndefined();
    expect(schema['$gte'][Kind]).toBe(referenceKind);
    expect(schema['$gte'][OptionalKind]).toBe('Optional');

    expect(schema).toHaveProperty('$between');
    expect(schema['$between'].description).toBe(`Between two values for type ${referenceType}`);
    expect(schema['$between'].type).toBe('array');
    expect(schema['$between'].items).toBeDefined();
    expect(schema['$between'].items).toHaveLength(2);
    expect(schema['$between'].items[0].type).toBe(referenceType);
    expect(schema['$between'].items[0][Kind]).toBe(referenceKind);
    expect(schema['$between'].items[1].type).toBe(referenceType);
    expect(schema['$between'].items[1][Kind]).toBe(referenceKind);
    expect(schema['$between'][Kind]).toBe('Tuple');
    expect(schema['$between'][OptionalKind]).toBe('Optional');

    expect(schema).toHaveProperty('$nbetween');
    expect(schema['$nbetween'].description).toBe(`Not between two values for type ${referenceType}`);
    expect(schema['$nbetween'].type).toBe('array');
    expect(schema['$nbetween'].items).toBeDefined();
    expect(schema['$nbetween'].items).toHaveLength(2);
    expect(schema['$nbetween'].items[0].type).toBe(referenceType);
    expect(schema['$nbetween'].items[0][Kind]).toBe(referenceKind);
    expect(schema['$nbetween'].items[1].type).toBe(referenceType);
    expect(schema['$nbetween'].items[1][Kind]).toBe(referenceKind);
    expect(schema['$nbetween'][Kind]).toBe('Tuple');
    expect(schema['$nbetween'][OptionalKind]).toBe('Optional');
};

describe('createPropertiesSearchSchema', () => {
    test('should create correct basic structure for all properties', () => {
        const propertiesSearchSchema = createPropertiesSearchSchema(baseSchema);

        for (const key of Object.keys(baseSchema.properties)) {
            const propertySchema = propertiesSearchSchema[key];
            expect(propertySchema).toBeDefined();
            expect(propertySchema[Kind]).toBe('Array');
            expect(propertySchema.type).toBe('array');
            expect(propertySchema.items[Kind]).toBe('Union');
            expect(propertySchema.items.anyOf).toBeDefined();
            expect(propertySchema.items.anyOf.length).toBe(2);
            expect(propertySchema.items.anyOf[0][Kind]).toBe('Object');
        }
    });

    test('should create correct operators for string properties', () => {
        const propertiesSearchSchema = createPropertiesSearchSchema(baseSchema);
        const stringProperties = Object.keys(baseSchema.properties).filter(
            (key) => baseSchema.properties[key as keyof typeof baseSchema.properties][Kind] === 'String' && baseSchema.properties[key as keyof typeof baseSchema.properties].format !== 'date-time'
        );

        for (const key of stringProperties) {
            const whereClauseSchema = propertiesSearchSchema[key].items.anyOf[0].properties;

            _checkBasicOperators(whereClauseSchema, 'string', 'String');
            _checkArrayAndPatternOperators(whereClauseSchema, 'string', 'String');

            // String properties should not have comparison operators
            expect(whereClauseSchema).not.toHaveProperty('$lt');
            expect(whereClauseSchema).not.toHaveProperty('$lte');
            expect(whereClauseSchema).not.toHaveProperty('$gt');
            expect(whereClauseSchema).not.toHaveProperty('$gte');
            expect(whereClauseSchema).not.toHaveProperty('$between');
            expect(whereClauseSchema).not.toHaveProperty('$nbetween');
        }
    });

    test('should create correct operators for number properties', () => {
        const propertiesSearchSchema = createPropertiesSearchSchema(baseSchema);
        // Only test t.Number() properties, not t.Integer() which has a different structure
        const numberProperties = Object.keys(baseSchema.properties).filter(
            (key) => baseSchema.properties[key as keyof typeof baseSchema.properties][Kind] === 'Number'
        );

        for (const key of numberProperties) {
            const whereClauseSchema = propertiesSearchSchema[key].items.anyOf[0].properties;

            _checkBasicOperators(whereClauseSchema, 'number', 'Number');
            _checkArrayAndPatternOperators(whereClauseSchema, 'number', 'Number');
            _checkComparisonOperators(whereClauseSchema, 'number', 'Number');
        }
    });

    test('should create correct operators for integer properties', () => {
        const propertiesSearchSchema = createPropertiesSearchSchema(baseSchema);
        const integerProperties = Object.keys(baseSchema.properties).filter(
            (key) => baseSchema.properties[key as keyof typeof baseSchema.properties][Kind] === 'Integer'
        );

        for (const key of integerProperties) {
            const whereClauseSchema = propertiesSearchSchema[key].items.anyOf[0].properties;

            _checkBasicOperators(whereClauseSchema, 'integer', 'Integer');
            _checkArrayAndPatternOperators(whereClauseSchema, 'integer', 'Integer');
            _checkComparisonOperators(whereClauseSchema, 'integer', 'Integer');
        }
    });

    test('should create correct operators for date properties', () => {
        const propertiesSearchSchema = createPropertiesSearchSchema(baseSchema);
        const dateProperties = Object.keys(baseSchema.properties).filter(
            (key) => (baseSchema.properties[key as keyof typeof baseSchema.properties][Kind] === 'String'
                && baseSchema.properties[key as keyof typeof baseSchema.properties].format === 'date-time')
            // Todo maybe one day i add support for date type (but not now)
            // || (
            //     baseSchema.properties[key as keyof typeof baseSchema.properties][Kind] === 'Union' as string
            //     && (baseSchema.properties[key as keyof typeof baseSchema.properties].anyOf as TSchema[]).some(
            //         (item: TSchema) => item[Kind] === 'String' && item.format === 'date-time'
            //     ))
        );

        for (const key of dateProperties) {
            const whereClauseSchema = propertiesSearchSchema[key].items.anyOf[0].properties;
            const originPropSchema = baseSchema.properties[key as keyof typeof baseSchema.properties];

            _checkBasicOperators(whereClauseSchema, originPropSchema.type ? originPropSchema.type: 'date', originPropSchema[Kind]);
            _checkArrayAndPatternOperators(whereClauseSchema, originPropSchema.type ? originPropSchema.type: 'date', originPropSchema[Kind]);
            _checkComparisonOperators(whereClauseSchema, originPropSchema.type ? originPropSchema.type: 'date', originPropSchema[Kind]);
        }
    });

    test('should create correct operators for boolean properties', () => {
        const propertiesSearchSchema = createPropertiesSearchSchema(baseSchema);
        const booleanProperties = ['isActive'];

        for (const key of booleanProperties) {
            const whereClauseSchema = propertiesSearchSchema[key].items.anyOf[0].properties;

            _checkBasicOperators(whereClauseSchema, 'boolean', 'Boolean');

            // Boolean properties should not have array/pattern or comparison operators
            expect(whereClauseSchema).not.toHaveProperty('$in');
            expect(whereClauseSchema).not.toHaveProperty('$nin');
            expect(whereClauseSchema).not.toHaveProperty('$like');
            expect(whereClauseSchema).not.toHaveProperty('$nlike');
            expect(whereClauseSchema).not.toHaveProperty('$lt');
            expect(whereClauseSchema).not.toHaveProperty('$lte');
            expect(whereClauseSchema).not.toHaveProperty('$gt');
            expect(whereClauseSchema).not.toHaveProperty('$gte');
            expect(whereClauseSchema).not.toHaveProperty('$between');
            expect(whereClauseSchema).not.toHaveProperty('$nbetween');
        }
    });

    test('should include all schema properties in the result', () => {
        const propertiesSearchSchema = createPropertiesSearchSchema(baseSchema);
        const expectedKeys: string[] = ['id', 'name', 'isActive', 'createdAt', 'country', 'updatedAt'];
        const actualKeys: string[] = Object.keys(propertiesSearchSchema);

        // Check that all expected keys are present
        for (const key of expectedKeys)
            expect(actualKeys).toContain(key);
        expect(actualKeys).toHaveLength(expectedKeys.length);
    });
});
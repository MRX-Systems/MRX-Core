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


describe('createPropertiesSearchSchema', () => {
    test('should have a correct structure for properties search schema', () => {
        const propertiesSearchSchema = createPropertiesSearchSchema(baseSchema);

        for (const key of Object.keys(baseSchema.properties)) {
            const propertySchema = propertiesSearchSchema[key];
            expect(propertySchema).toBeDefined();
            expect(propertySchema[Kind]).toBe('Array');
            expect(propertySchema.type).toBe('array');
            expect(propertySchema.items[Kind]).toBe('Union');
            expect(propertySchema.items.anyOf).toBeDefined();
            expect(propertySchema.items.anyOf.length).toBe(2);

            // check where clause schema
            expect(propertySchema.items.anyOf[0][Kind]).toBe('Object');
            // check by type of property

            const checkForBasicOperators = (
                schema: Record<string, TSchema>,
                referenceType: string,
                referenceKind: string
            ) => {
                expect(schema).toHaveProperty('$eq');
                expect(schema['$eq'].type).toBe(referenceType);
                expect(schema['$eq'].description).toBe(
                    `Equal to the specified value of type ${referenceType}`
                );
                expect(schema['$eq'].examples).toHaveLength(0);
                expect(schema['$eq'].example).toBeUndefined();
                expect(schema['$eq'][Kind]).toBe(referenceKind);
                expect(schema['$eq'][OptionalKind]).toBe('Optional');


                expect(schema).toHaveProperty('$neq');
                expect(schema['$neq'].type).toBe(referenceType);
                expect(schema['$neq'].description).toBe(
                    `Not equal to the specified value of type ${referenceType}`
                );
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

            const checkForStringNumberDateOperators = (
                schema: Record<string, TSchema>,
                referenceType: string,
                referenceKind: string
            ) => {
                expect(schema).toHaveProperty('$in');
                expect(schema['$in'].description).toBe(
                    `Array of values to match against the value of type ${referenceType}`
                );
                expect(schema['$in'].minItems).toBe(1);
                expect(schema['$in'].uniqueItems).toBe(true);
                expect(schema['$in'].type).toBe('array');
                expect(schema['$in'].items).toBeDefined();
                expect(schema['$in'].items.type).toBe(referenceType);
                expect(schema['$in'].items[Kind]).toBe(referenceKind);
                expect(schema['$in'][Kind]).toBe('Array');
                expect(schema['$in'][OptionalKind]).toBe('Optional');



                expect(schema).toHaveProperty('$nin');
                expect(schema['$nin'].description).toBe(
                    `Array of values to exclude from matching the value of type ${referenceType}`
                );
                expect(schema['$nin'].minItems).toBe(1);
                expect(schema['$nin'].uniqueItems).toBe(true);
                expect(schema['$nin'].type).toBe('array');
                expect(schema['$nin'].items).toBeDefined();
                expect(schema['$nin'].items.type).toBe(referenceType);
                expect(schema['$nin'].items[Kind]).toBe(referenceKind);
                expect(schema['$nin'][Kind]).toBe('Array');
                expect(schema['$nin'][OptionalKind]).toBe('Optional');

                expect(schema).toHaveProperty('$like');
                expect(schema['$like'].description).toBe(
                    `Pattern to match against the string value of type ${referenceType}. Supports SQL-like wildcards (%)`
                );
                expect(schema['$like'].type).toBe('string');
                expect(schema['$like'][Kind]).toBe('String');
                expect(schema['$like'][OptionalKind]).toBe('Optional');

                expect(schema).toHaveProperty('$nlike');
                expect(schema['$nlike'].description).toBe(
                    `Pattern to exclude from matching the string value of type ${referenceType}. Supports SQL-like wildcards (%)`
                );
                expect(schema['$nlike'].type).toBe('string');
                expect(schema['$nlike'][Kind]).toBe('String');
                expect(schema['$nlike'][OptionalKind]).toBe('Optional');
            };

            const checkForNumberDateOperators = (
                schema: Record<string, TSchema>,
                referenceType: string,
                referenceKind: string
            ) => {
                expect(schema).toHaveProperty('$lt');
                expect(schema['$lt'].type).toBe(referenceType);
                expect(schema['$lt'].description).toBe(
                    `Less than the specified value of type ${referenceType}`
                );
                expect(schema['$lt'].examples).toHaveLength(0);
                expect(schema['$lt'].example).toBeUndefined();
                expect(schema['$lt'][Kind]).toBe(referenceKind);
                expect(schema['$lt'][OptionalKind]).toBe('Optional');


                expect(schema).toHaveProperty('$lte');
                expect(schema['$lte'].type).toBe(referenceType);
                expect(schema['$lte'].description).toBe(
                    `Less than or equal to the specified value of type ${referenceType}`
                );
                expect(schema['$lte'].examples).toHaveLength(0);
                expect(schema['$lte'].example).toBeUndefined();
                expect(schema['$lte'][Kind]).toBe(referenceKind);
                expect(schema['$lte'][OptionalKind]).toBe('Optional');

                expect(schema).toHaveProperty('$gt');
                expect(schema['$gt'].type).toBe(referenceType);
                expect(schema['$gt'].description).toBe(
                    `Greater than the specified value of type ${referenceType}`
                );
                expect(schema['$gt'].examples).toHaveLength(0);
                expect(schema['$gt'].example).toBeUndefined();
                expect(schema['$gt'][Kind]).toBe(referenceKind);
                expect(schema['$gt'][OptionalKind]).toBe('Optional');

                expect(schema).toHaveProperty('$gte');
                expect(schema['$gte'].type).toBe(referenceType);
                expect(schema['$gte'].description).toBe(
                    `Greater than or equal to the specified value of type ${referenceType}`
                );
                expect(schema['$gte'].examples).toHaveLength(0);
                expect(schema['$gte'].example).toBeUndefined();
                expect(schema['$gte'][Kind]).toBe(referenceKind);
                expect(schema['$gte'][OptionalKind]).toBe('Optional');

                expect(schema).toHaveProperty('$between');
                expect(schema['$between'].description).toBe(
                    `Between two values for type ${referenceType}`
                );
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
                expect(schema['$nbetween'].description).toBe(
                    `Not between two values for type ${referenceType}`
                );
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

            switch (baseSchema.properties[key as keyof typeof baseSchema.properties].type) {
                case 'string':
                    checkForBasicOperators(propertySchema.items.anyOf[0].properties, 'string', 'String');
                    checkForStringNumberDateOperators(propertySchema.items.anyOf[0].properties, 'string', 'String');
                    break;
                case 'number':
                case 'integer':
                case 'date':
                    checkForBasicOperators(propertySchema.items.anyOf[0].properties, 'number', 'Number');
                    checkForStringNumberDateOperators(propertySchema.items.anyOf[0].properties, 'number', 'Number');
                    checkForNumberDateOperators(propertySchema.items.anyOf[0].properties, 'number', 'Number');
                    break;
                case 'boolean':
                    checkForBasicOperators(propertySchema.items.anyOf[0].properties, 'boolean', 'Boolean');
                    break;
            }
        }
    });
});
import { Kind, OptionalKind, type TSchema } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';
import { t } from 'elysia/type-system';

import { createAdaptiveWhereClauseSchema } from '#/modules/elysia/queryOptionsBuilderPlugin/utils/createAdaptiveWhereClauseSchema';


describe('createAdaptiveWhereClauseSchema', () => {
    describe.each([
        [
            'String',
            t.String(),
            [
                '$eq',
                '$neq',
                '$isNull',
                '$in',
                '$nin',
                '$like',
                '$nlike'
            ]
        ],
        [
            'Number',
            t.Number(),
            [
                '$eq',
                '$neq',
                '$isNull',
                '$in',
                '$nin',
                '$like',
                '$nlike',
                '$lt',
                '$lte',
                '$gt',
                '$gte',
                '$between',
                '$nbetween'
            ]
        ],
        [
            'Date',
            t.Date(),
            [
                '$eq',
                '$neq',
                '$isNull',
                '$in',
                '$nin',
                '$like',
                '$nlike',
                '$lt',
                '$lte',
                '$gt',
                '$gte',
                '$between',
                '$nbetween'
            ]
        ],
        [
            'Boolean',
            t.Boolean(),
            [
                '$eq',
                '$neq',
                '$isNull'
            ]
        ]
    ])('type: %s', (typeName, schema, expectedOperators) => {
        test(`should have a good Kind and type for ${typeName}`, () => {
            const adaptiveWhereClauseSchema = createAdaptiveWhereClauseSchema(schema);
            expect(adaptiveWhereClauseSchema[Kind]).toBe('Object');
            expect(adaptiveWhereClauseSchema.type).toBe('object');
        });

        test(`should have correct properties for ${typeName}`, () => {
            const adaptiveWhereClauseSchema = createAdaptiveWhereClauseSchema(schema);
            expect(adaptiveWhereClauseSchema.properties).toBeDefined();

            for (const operator of expectedOperators)
                expect(adaptiveWhereClauseSchema.properties[operator as keyof typeof adaptiveWhereClauseSchema.properties]).toBeDefined();
        });

        test.each(expectedOperators)('should have correct type for operator %s', (operator) => {
            const adaptiveWhereClauseSchema = createAdaptiveWhereClauseSchema(schema);
            const operatorSchema: TSchema = adaptiveWhereClauseSchema.properties[operator as keyof typeof adaptiveWhereClauseSchema.properties];

            if (operator === '$isNull') {
                expect(operatorSchema.type).toBe('boolean');
                expect(operatorSchema[Kind]).toBe('Boolean');
                expect(operatorSchema[OptionalKind]).toBe('Optional');
            } else if (['$in', '$nin'].includes(operator)) {
                expect(operatorSchema.type).toBe('array');
                expect(operatorSchema[Kind]).toBe('Array');
                expect(operatorSchema.minItems).toBe(1);
                expect(operatorSchema.uniqueItems).toBe(true);
                expect(operatorSchema.items).toEqual(schema);
                expect(operatorSchema.items[Kind]).toBe(schema[Kind]);
                expect(operatorSchema.items.type).toBe(schema.type);
                expect(operatorSchema[OptionalKind]).toBe('Optional');
            } else if (['$like', '$nlike'].includes(operator)) {
                expect(operatorSchema.type).toBe('string');
                expect(operatorSchema[Kind]).toBe('String');
                expect(operatorSchema[OptionalKind]).toBe('Optional');
            } else if (['$between', '$nbetween'].includes(operator)) {
                expect(operatorSchema.type).toBe('array');
                expect(operatorSchema[Kind]).toBe('Tuple');
                expect(operatorSchema[OptionalKind]).toBe('Optional');
                expect(operatorSchema.minItems).toBe(2);
                expect(operatorSchema.maxItems).toBe(2);
                expect(operatorSchema.items).toBeDefined();
                expect(operatorSchema.items).toHaveLength(2);
                expect(operatorSchema.items[0]).toEqual(schema);
                expect(operatorSchema.items[0][Kind]).toBe(schema[Kind]);
                expect(operatorSchema.items[0].type).toBe(schema.type);
                expect(operatorSchema.items[1]).toEqual(schema);
                expect(operatorSchema.items[1][Kind]).toBe(schema[Kind]);
                expect(operatorSchema.items[1].type).toBe(schema.type);
            } else {
                expect(operatorSchema[Kind]).toBe(schema[Kind]);
                expect(operatorSchema.type).toBe(schema.type);
                expect(operatorSchema[OptionalKind]).toBe('Optional');
            }
        });
    });
});
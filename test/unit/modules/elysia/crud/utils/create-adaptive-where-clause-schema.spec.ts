import { Kind, KindGuard, type TSchema } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';
import { t } from 'elysia/type-system';

import { createAdaptiveWhereClauseSchema } from '#/modules/elysia/crud/utils/create-adaptive-where-clause-schema';

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
		test(`should have a good type for ${typeName}`, () => {
			const adaptiveWhereClauseSchema = createAdaptiveWhereClauseSchema(schema);
			expect(KindGuard.IsObject(adaptiveWhereClauseSchema)).toBe(true);
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
				expect(KindGuard.IsBoolean(operatorSchema)).toBe(true);
				expect(KindGuard.IsOptional(operatorSchema)).toBe(true);
			} else if (['$in', '$nin'].includes(operator)) {
				expect(KindGuard.IsArray(operatorSchema)).toBe(true);
				expect(operatorSchema.minItems).toBe(1);
				expect(operatorSchema.uniqueItems).toBe(true);
				expect(operatorSchema.items).toEqual(schema);
				expect(operatorSchema.items[Kind]).toBe(schema[Kind]);
				expect(KindGuard.IsOptional(operatorSchema)).toBe(true);
			} else if (['$like', '$nlike'].includes(operator)) {
				expect(KindGuard.IsString(operatorSchema)).toBe(true);
				expect(KindGuard.IsOptional(operatorSchema)).toBe(true);
			} else if (['$between', '$nbetween'].includes(operator)) {
				expect(KindGuard.IsTuple(operatorSchema)).toBe(true);
				expect(KindGuard.IsOptional(operatorSchema)).toBe(true);
				expect(operatorSchema.minItems).toBe(2);
				expect(operatorSchema.maxItems).toBe(2);
				expect(operatorSchema.items).toBeDefined();
				expect(operatorSchema.items).toHaveLength(2);
				expect(operatorSchema.items[0]).toEqual(schema);
				expect(operatorSchema.items[0][Kind]).toBe(schema[Kind]);
				expect(operatorSchema.items[1]).toEqual(schema);
				expect(operatorSchema.items[1][Kind]).toBe(schema[Kind]);
			} else {
				expect(operatorSchema[Kind]).toBe(schema[Kind]);
				expect(KindGuard.IsOptional(operatorSchema)).toBe(true);
			}
		});
	});
});
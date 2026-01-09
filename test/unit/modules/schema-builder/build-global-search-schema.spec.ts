import { Kind, KindGuard } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';
import { t } from 'elysia/type-system';

import { buildGlobalSearchSchema } from '#/modules/schema-builder/build-global-search-schema';

const baseSchema = t.Object({
	id: t.Number(),
	name: t.String(),
	createdAt: t.String({ format: 'date-time' }),
	updatedAt: t.Date()
});


describe.concurrent('buildGlobalSearchSchema', () => {
	describe('schema structure validation', () => {
		test('should create as schema with a good type', () => {
			const qSchema = buildGlobalSearchSchema(baseSchema);
			expect(KindGuard.IsUnion(qSchema)).toBe(true);
		});

		test('should have an anyOf with three elements', () => {
			const qSchema = buildGlobalSearchSchema(baseSchema);
			expect(qSchema.anyOf).toBeDefined();
			expect(qSchema.anyOf).toHaveLength(3);
		});
	});

	describe('first union element (object with selectedFields and value)', () => {
		test('should be an object with correct structure', () => {
			const qSchema = buildGlobalSearchSchema(baseSchema);
			const [firstElement] = qSchema.anyOf;

			expect(KindGuard.IsObject(firstElement)).toBe(true);
			expect(firstElement.properties).toBeDefined();
		});

		test('should have required selectedFields and value properties', () => {
			const qSchema = buildGlobalSearchSchema(baseSchema);
			const [firstElement] = qSchema.anyOf;

			expect(firstElement.required).toContain('selectedFields');
			expect(firstElement.required).toContain('value');
		});

		describe('selectedFields property', () => {
			test('should be a union with two options', () => {
				const qSchema = buildGlobalSearchSchema(baseSchema);
				const [firstElement] = qSchema.anyOf;
				const { selectedFields } = firstElement.properties;

				expect(KindGuard.IsUnion(selectedFields)).toBe(true);
				expect(selectedFields.anyOf).toBeDefined();
				expect(selectedFields.anyOf).toHaveLength(2);
			});

			test('should have first option as union of all schema keys', () => {
				const qSchema = buildGlobalSearchSchema(baseSchema);
				const [firstElement] = qSchema.anyOf;
				const { selectedFields } = firstElement.properties;

				expect(KindGuard.IsUnion(selectedFields.anyOf[0])).toBe(true);
				expect(selectedFields.anyOf[0].anyOf).toBeDefined();
				expect(selectedFields.anyOf[0].anyOf).toHaveLength(Object.keys(baseSchema.properties).length);

				for (const key of Object.keys(baseSchema.properties))
					expect(selectedFields.anyOf[0].anyOf).toContainEqual({
						[Kind]: 'Literal',
						const: key,
						type: 'string'
					});
			});

			test('should have second option as array of schema keys', () => {
				const qSchema = buildGlobalSearchSchema(baseSchema);
				const [firstElement] = qSchema.anyOf;
				const { selectedFields } = firstElement.properties;

				expect(KindGuard.IsArray(selectedFields.anyOf[1])).toBe(true);
				expect(selectedFields.anyOf[1].minItems).toBe(1);
				expect(selectedFields.anyOf[1].uniqueItems).toBe(true);
				expect(selectedFields.anyOf[1].items).toBeDefined();
			});

			test('should have array items as union of all schema keys', () => {
				const qSchema = buildGlobalSearchSchema(baseSchema);
				const [firstElement] = qSchema.anyOf;
				const { selectedFields } = firstElement.properties;
				const [, arrayOption] = selectedFields.anyOf;

				expect(KindGuard.IsUnion(arrayOption.items)).toBe(true);
				expect(arrayOption.items.anyOf).toHaveLength(Object.keys(baseSchema.properties).length);

				for (const key of Object.keys(baseSchema.properties))
					expect(arrayOption.items.anyOf).toContainEqual({
						[Kind]: 'Literal',
						const: key,
						type: 'string'
					});
			});
		});

		describe('value property', () => {
			test('should be a union of number and string', () => {
				const qSchema = buildGlobalSearchSchema(baseSchema);
				const [firstElement] = qSchema.anyOf;
				const { value } = firstElement.properties;

				expect(KindGuard.IsUnion(value)).toBe(true);
				expect(value.anyOf).toBeDefined();
				expect(value.anyOf).toHaveLength(2);
			});

			test('should have number as first option', () => {
				const qSchema = buildGlobalSearchSchema(baseSchema);
				const [firstElement] = qSchema.anyOf;
				const { value } = firstElement.properties;

				expect(KindGuard.IsNumber(value.anyOf[0])).toBe(true);
			});

			test('should have string as second option', () => {
				const qSchema = buildGlobalSearchSchema(baseSchema);
				const [firstElement] = qSchema.anyOf;
				const { value } = firstElement.properties;

				expect(KindGuard.IsString(value.anyOf[1])).toBe(true);
			});
		});
	});

	describe('union elements', () => {
		test('should create second union element as number', () => {
			const qSchema = buildGlobalSearchSchema(baseSchema);

			const [, secondElement] = qSchema.anyOf;
			expect(KindGuard.IsNumber(secondElement)).toBe(true);
		});

		test('should create third union element as string', () => {
			const qSchema = buildGlobalSearchSchema(baseSchema);

			const [, , thirdElement] = qSchema.anyOf;
			expect(KindGuard.IsString(thirdElement)).toBe(true);
		});
	});
});
import { KindGuard, type TSchema } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';
import { t } from 'elysia/type-system';

import { createResponse200Schema } from '#/modules/elysia/crud/utils/create-response-200-schema';

const baseSchema = t.Object({
	id: t.Number(),
	name: t.String(),
	createdAt: t.String({ format: 'date-time' }),
	updatedAt: t.Date()
});

const simpleSchema = t.Object({
	id: t.Number(),
	name: t.String(),
	isActive: t.Boolean()
});


describe('createResponse200Schema', () => {
	test('should create a schema with a good type and kind', () => {
		const responseSchema = createResponse200Schema(baseSchema);
		expect(KindGuard.IsObject(responseSchema)).toBe(true);
	});

	describe('schema properties validation', () => {
		test('should have message property with correct type', () => {
			const responseSchema = createResponse200Schema(baseSchema);

			expect(responseSchema.properties).toHaveProperty('message');
			expect(KindGuard.IsString(responseSchema.properties.message)).toBe(true);
		});

		test('should have content property with correct array structure', () => {
			const responseSchema = createResponse200Schema(baseSchema);

			expect(responseSchema.properties).toHaveProperty('content');
			expect(KindGuard.IsArray(responseSchema.properties.content)).toBe(true);
		});

		test('should have content items as objects', () => {
			const responseSchema = createResponse200Schema(baseSchema);

			expect(KindGuard.IsObject(responseSchema.properties.content.items)).toBe(true);
		});
	});

	describe('content items properties validation', () => {
		test('should have all base schema properties in content items', () => {
			const responseSchema = createResponse200Schema(baseSchema);
			const { properties }: { properties: Record<string, TSchema> } = responseSchema.properties.content.items;

			for (const key of Object.keys(baseSchema.properties))
				expect(properties).toHaveProperty(key);
		});

		test('should all properties be unions', () => {
			const responseSchema = createResponse200Schema(baseSchema);
			const { properties }: { properties: Record<string, TSchema> } = responseSchema.properties.content.items;

			for (const key of Object.keys(baseSchema.properties))
				expect(KindGuard.IsUnion(properties[key])).toBe(true);
		});

		describe('simple types handling (Number, String, Boolean)', () => {
			test('should simple types have exactly 2 union options (Type + Null)', () => {
				const responseSchema = createResponse200Schema(simpleSchema);
				const { properties }: { properties: Record<string, TSchema> } = responseSchema.properties.content.items;

				// Test simple types only
				const simpleKeys = ['id', 'name', 'isActive'];
				for (const key of simpleKeys) {
					expect(properties[key].anyOf).toHaveLength(2);

					// Check that null is always present
					const unionTypes = properties[key].anyOf as TSchema[];
					const hasNull = unionTypes.some((schema: TSchema) => KindGuard.IsNull(schema));
					expect(hasNull).toBe(true);
				}
			});

			test('should simple types preserve original type in union', () => {
				const responseSchema = createResponse200Schema(simpleSchema);
				const { properties }: { properties: Record<string, TSchema> } = responseSchema.properties.content.items;

				// id should have Number + Null
				const [idFirst, idSecond] = properties.id.anyOf;
				expect(KindGuard.IsNumber(idFirst) || KindGuard.IsNumber(idSecond)).toBe(true);
				expect(KindGuard.IsNull(idFirst) || KindGuard.IsNull(idSecond)).toBe(true);

				// name should have String + Null
				const [nameFirst, nameSecond] = properties.name.anyOf;
				expect(KindGuard.IsString(nameFirst) || KindGuard.IsString(nameSecond)).toBe(true);
				expect(KindGuard.IsNull(nameFirst) || KindGuard.IsNull(nameSecond)).toBe(true);

				// isActive should have Boolean + Null
				const [boolFirst, boolSecond] = properties.isActive.anyOf;
				expect(KindGuard.IsBoolean(boolFirst) || KindGuard.IsBoolean(boolSecond)).toBe(true);
				expect(KindGuard.IsNull(boolFirst) || KindGuard.IsNull(boolSecond)).toBe(true);
			});
		});

		describe('complex types handling (Date, etc.)', () => {
			test('should complex types include null in their union', () => {
				const responseSchema = createResponse200Schema(baseSchema);
				const { properties }: { properties: Record<string, TSchema> } = responseSchema.properties.content.items;

				// updatedAt is a complex type (t.Date() produces a union)
				const unionTypes = properties.updatedAt.anyOf as TSchema[];
				const hasNull = unionTypes.some((schema: TSchema) => KindGuard.IsNull(schema));
				expect(hasNull).toBe(true);
			});

			test('should complex types have multiple options due to flattening', () => {
				const responseSchema = createResponse200Schema(baseSchema);
				const { properties }: { properties: Record<string, TSchema> } = responseSchema.properties.content.items;

				// updatedAt should have more than 2 options because t.Date() is complex
				expect(properties.updatedAt.anyOf.length).toBeGreaterThan(2);
			});

			test('should Date type contain expected type variants', () => {
				const responseSchema = createResponse200Schema(baseSchema);
				const { properties }: { properties: Record<string, TSchema> } = responseSchema.properties.content.items;

				const dateUnion = properties.updatedAt.anyOf as TSchema[];

				// Should contain null
				expect(dateUnion.some((schema: TSchema) => KindGuard.IsNull(schema))).toBe(true);

				// Should contain at least one string type (for date-time format)
				expect(dateUnion.some((schema: TSchema) => KindGuard.IsString(schema))).toBe(true);

				// Should contain number type (timestamp)
				expect(dateUnion.some((schema: TSchema) => KindGuard.IsNumber(schema))).toBe(true);
			});
		});
	});

	describe('required properties validation', () => {
		test('should message is required', () => {
			const responseSchema = createResponse200Schema(baseSchema);
			expect(responseSchema.required).toContain('message');
		});

		test('should content is required', () => {
			const responseSchema = createResponse200Schema(baseSchema);
			expect(responseSchema.required).toContain('content');
		});
	});
});
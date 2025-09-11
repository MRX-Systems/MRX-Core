import { Kind, KindGuard, OptionalKind, type TSchema } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';
import { t } from 'elysia/type-system';

import { createResponse200Schema } from '#/modules/elysia/crud/utils/create-response-200-schema';

const baseSchema = t.Object({
	id: t.Number(),
	name: t.String(),
	createdAt: t.String({ format: 'date-time' }),
	updatedAt: t.Date()
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

		test('should all properties be unions and optional', () => {
			const responseSchema = createResponse200Schema(baseSchema);
			const { properties }: { properties: Record<string, TSchema> } = responseSchema.properties.content.items;

			for (const key of Object.keys(baseSchema.properties)) {
				expect(KindGuard.IsUnion(properties[key])).toBe(true);
				expect(KindGuard.IsOptional(properties[key])).toBe(true);
			}
		});

		describe('string properties handling', () => {
			test('should string properties have 4 union options', () => {
				const responseSchema = createResponse200Schema(baseSchema);
				const { properties }: { properties: Record<string, TSchema> } = responseSchema.properties.content.items;

				for (const key of Object.keys(baseSchema.properties))
					if (baseSchema.properties[key as keyof typeof baseSchema.properties][Kind] === 'String')
						expect(properties[key].anyOf).toHaveLength(4);
			});

			test('should string properties have correct union types', () => {
				const responseSchema = createResponse200Schema(baseSchema);
				const { properties }: { properties: Record<string, TSchema> } = responseSchema.properties.content.items;

				for (const key of Object.keys(baseSchema.properties))
					if (baseSchema.properties[key as keyof typeof baseSchema.properties][Kind] === 'String') {
						const [firstOption, secondOption, thirdOption, fourthOption] = properties[key].anyOf;

						expect(KindGuard.IsString(firstOption)).toBe(true);
						expect(KindGuard.IsUndefined(secondOption)).toBe(true);
						expect(KindGuard.IsLiteral(thirdOption)).toBe(true);
						expect(thirdOption.const).toBe('');
						expect(KindGuard.IsNull(fourthOption)).toBe(true);
					}
			});
		});

		describe('non-string properties handling', () => {
			test('should non-string properties have 3 union options', () => {
				const responseSchema = createResponse200Schema(baseSchema);
				const { properties }: { properties: Record<string, TSchema> } = responseSchema.properties.content.items;

				for (const key of Object.keys(baseSchema.properties))
					if (!KindGuard.IsString(baseSchema.properties[key as keyof typeof baseSchema.properties]))
						expect(properties[key].anyOf).toHaveLength(3);
			});

			test('should non-string properties have correct union types', () => {
				const responseSchema = createResponse200Schema(baseSchema);
				const { properties }: { properties: Record<string, TSchema> } = responseSchema.properties.content.items;

				for (const key of Object.keys(baseSchema.properties))
					if (!KindGuard.IsString(baseSchema.properties[key as keyof typeof baseSchema.properties])) {
						const [firstOption, secondOption, thirdOption] = properties[key].anyOf;

						expect(firstOption[Kind]).toBe(baseSchema.properties[key as keyof typeof baseSchema.properties][Kind]);
						expect(firstOption[OptionalKind]).toBe(baseSchema.properties[key as keyof typeof baseSchema.properties][OptionalKind]);

						expect(KindGuard.IsUndefined(secondOption)).toBe(true);
						expect(KindGuard.IsNull(thirdOption)).toBe(true);
					}
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
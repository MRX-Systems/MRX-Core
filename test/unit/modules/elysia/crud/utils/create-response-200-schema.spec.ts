import { Kind, OptionalKind, type TSchema } from '@sinclair/typebox';
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
		expect(responseSchema.type).toBe('object');
		expect(responseSchema[Kind]).toBe('Object');
	});

	describe('schema properties validation', () => {
		test('should have message property with correct type', () => {
			const responseSchema = createResponse200Schema(baseSchema);

			expect(responseSchema.properties).toHaveProperty('message');
			expect(responseSchema.properties.message.type).toBe('string');
			expect(responseSchema.properties.message[Kind]).toBe('String');
		});

		test('should have content property with correct array structure', () => {
			const responseSchema = createResponse200Schema(baseSchema);

			expect(responseSchema.properties).toHaveProperty('content');
			expect(responseSchema.properties.content.type).toBe('array');
			expect(responseSchema.properties.content[Kind]).toBe('Array');
		});

		test('should have content items as objects', () => {
			const responseSchema = createResponse200Schema(baseSchema);

			expect(responseSchema.properties.content.items.type).toBe('object');
			expect(responseSchema.properties.content.items[Kind]).toBe('Object');
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
				expect(properties[key][Kind]).toBe('Union');
				expect(properties[key][OptionalKind]).toBe('Optional');
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

						expect(firstOption[Kind]).toBe('String');
						expect(firstOption.type).toBe('string');

						expect(secondOption[Kind]).toBe('Undefined');
						expect(secondOption.type).toBe('undefined');

						expect(thirdOption[Kind]).toBe('Literal');
						expect(thirdOption.type).toBe('string');
						expect(thirdOption.const).toBe('');

						expect(fourthOption[Kind]).toBe('Null');
						expect(fourthOption.type).toBe('null');
					}
			});
		});

		describe('non-string properties handling', () => {
			test('should non-string properties have 3 union options', () => {
				const responseSchema = createResponse200Schema(baseSchema);
				const { properties }: { properties: Record<string, TSchema> } = responseSchema.properties.content.items;

				for (const key of Object.keys(baseSchema.properties))
					if (baseSchema.properties[key as keyof typeof baseSchema.properties][Kind] !== 'String')
						expect(properties[key].anyOf).toHaveLength(3);
			});

			test('should non-string properties have correct union types', () => {
				const responseSchema = createResponse200Schema(baseSchema);
				const { properties }: { properties: Record<string, TSchema> } = responseSchema.properties.content.items;

				for (const key of Object.keys(baseSchema.properties))
					if (baseSchema.properties[key as keyof typeof baseSchema.properties][Kind] !== 'String') {
						const [firstOption, secondOption, thirdOption] = properties[key].anyOf;

						expect(firstOption[Kind]).toBe(baseSchema.properties[key as keyof typeof baseSchema.properties][Kind]);
						expect(firstOption[OptionalKind]).toBe(baseSchema.properties[key as keyof typeof baseSchema.properties][OptionalKind]);

						expect(secondOption[Kind]).toBe('Undefined');
						expect(secondOption.type).toBe('undefined');

						expect(thirdOption[Kind]).toBe('Null');
						expect(thirdOption.type).toBe('null');
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
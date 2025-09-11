import { KindGuard } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';

import { createCountResponse200Schema } from '#/modules/elysia/crud/utils/create-count-response-200-schema';

describe('createCountResponse200Schema', () => {
	test('should create a schema with a good type', () => {
		const schema = createCountResponse200Schema();
		expect(KindGuard.IsObject(schema)).toBe(true);
	});

	test('should have the correct properties', () => {
		const schema = createCountResponse200Schema();
		expect(schema.properties).toHaveProperty('message');
		expect(schema.properties).toHaveProperty('content');
	});

	test('should have the correct required properties', () => {
		const schema = createCountResponse200Schema();
		expect(schema.required).toEqual(['message', 'content']);
	});

	test('should have the correct types for properties', () => {
		const schema = createCountResponse200Schema();
		expect(KindGuard.IsString(schema.properties.message)).toBe(true);
		expect(KindGuard.IsNumber(schema.properties.content)).toBe(true);
	});
});
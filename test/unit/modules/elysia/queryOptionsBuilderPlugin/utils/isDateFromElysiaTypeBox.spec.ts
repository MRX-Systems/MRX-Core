import { describe, expect, test } from 'bun:test';
import { t } from 'elysia/type-system';

import { isDateFromElysiaTypeBox } from '#/modules/elysia/queryOptionsBuilderPlugin/utils/isDateFromElysiaTypeBox';

describe('isTypeBoxDateForElysia', () => {
	test('should return true for TypeBox Date type', () => {
		const dateSchema = t.Date();
		expect(isDateFromElysiaTypeBox(dateSchema)).toBe(true);
	});

	test('should return false for TypeBox String type', () => {
		const stringSchema = t.String();
		expect(isDateFromElysiaTypeBox(stringSchema)).toBe(false);
	});
});
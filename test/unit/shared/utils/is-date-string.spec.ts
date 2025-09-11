import { describe, expect, test } from 'bun:test';

import { isDateString } from '#/shared/utils/is-date-string';

describe('isDateString', () => {
	describe('Valid date strings', () => {
		test('should return true for ISO 8601 date strings', () => {
			expect(isDateString('2023-10-01')).toBe(true);
			expect(isDateString('2023-10-01T12:00:00Z')).toBe(true);
			expect(isDateString('2023-10-01T12:00:00')).toBe(true);
			expect(isDateString('2023-10-01T12:00:00.000Z')).toBe(true);
			expect(isDateString('2023-10-01T12:00:00.000+00:00')).toBe(true);
			expect(isDateString('2023-10-01T12:00:00.000-04:00')).toBe(true);
		});

		test('should return true for other valid date formats', () => {
			expect(isDateString('October 1, 2023')).toBe(true);
			expect(isDateString('2023/10/01')).toBe(true);
			expect(isDateString('10-01-2023')).toBe(true);
		});
	});

	describe('Invalid date strings', () => {
		test('should return false for clearly invalid strings', () => {
			expect(isDateString('invalid-date')).toBe(false);
			expect(isDateString('not-a-date')).toBe(false);
			expect(isDateString('')).toBe(false);
		});

		test('should return false for invalid date values', () => {
			expect(isDateString('2023-13-01')).toBe(false);
			expect(isDateString('2023-10-32')).toBe(false);
			expect(isDateString('2023/99/99')).toBe(false);
		});

		test('should return false for non-string inputs', () => {
			expect(isDateString(null)).toBe(false);
			expect(isDateString(undefined)).toBe(false);
			expect(isDateString(12345)).toBe(false);
		});
	});
});
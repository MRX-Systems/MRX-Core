import { describe, expect, test } from 'bun:test';

import { timeRemaining } from '#/modules/totp/utils/time-remaining';

describe.concurrent('timeRemaining', () => {
	test('should return period at exact boundary', () => {
		// At t=0, next boundary is t=30, so remaining = 30
		expect(timeRemaining(30, 0)).toBe(30);
	});

	test('should return 1 just before boundary', () => {
		// At t=29000ms (29s), remaining = 30 - 29 = 1
		expect(timeRemaining(30, 29_000)).toBe(1);
	});

	test('should return period just after boundary', () => {
		// At t=30000ms, next boundary is t=60, so remaining = 30
		expect(timeRemaining(30, 30_000)).toBe(30);
	});

	test('should work with custom period', () => {
		expect(timeRemaining(60, 0)).toBe(60);
		expect(timeRemaining(60, 59_000)).toBe(1);
	});

	test('should return value less than period for any time', () => {
		const now = Date.now();
		const remaining = timeRemaining(30, now);
		expect(remaining).toBeGreaterThan(0);
		expect(remaining).toBeLessThanOrEqual(30);
	});
});
import { describe, expect, test } from 'bun:test';

import { timeRemaining } from '#/modules/totp/utils/time-remaining';

describe('timeRemaining', () => {
	test.concurrent('should calculate the remaining time until the next TOTP code', () => {
		const period = 30;
		const now = Date.now();
		const remaining = timeRemaining(period, now);
		
		// Should be between 0 and period (exclusive of period, inclusive of 0)
		expect(remaining).toBeGreaterThanOrEqual(0);
		expect(remaining).toBeLessThan(period);
	});

	test.concurrent('should handle different period values', () => {
		const testCases = [
			{ period: 30, expected: { min: 0, max: 30 } },
			{ period: 60, expected: { min: 0, max: 60 } },
			{ period: 120, expected: { min: 0, max: 120 } }
		];

		for (const { period, expected } of testCases) {
			const now = Date.now();
			const remaining = timeRemaining(period, now);
			
			expect(remaining).toBeGreaterThanOrEqual(expected.min);
			expect(remaining).toBeLessThan(expected.max);
		}
	});
});
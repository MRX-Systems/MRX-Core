import { describe, expect, test } from 'bun:test';

import { timeRemaining } from '#/modules/totp/utils/time-remaining';

describe('timeRemaining', () => {
	test('should calculate the remaining time until the next TOTP code', () => {
		const period = 30;
		const now = Date.now() - 1000;
		const remaining = timeRemaining(period, now);
		expect(remaining).toBeLessThan(period);
	});
});
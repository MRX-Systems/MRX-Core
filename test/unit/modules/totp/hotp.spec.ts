import { describe, expect, test } from 'bun:test';

import { hotp } from '#/modules/totp/hotp';

describe('hotp', () => {
	test('should generate a valid HOTP code', async () => {
		const secret = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07]);
		const code = await hotp(secret, 1);
		expect(code).toBe('318050');
	});
});
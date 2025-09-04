import { describe, test, expect } from 'bun:test';

import { dynamicTruncation } from '#/modules/totp/utils/dynamic-truncation';

describe('dynamicTruncation', () => {
	test('should correctly truncate HMAC array with 6 digits', () => {
		// Test case from RFC 4226 Appendix D
		const hmacArray = new Uint8Array([
			0x1f,
			0x86,
			0x98,
			0x69,
			0x0e,
			0x02,
			0xca,
			0x16,
			0x61,
			0x85,
			0x50,
			0xef,
			0x7f,
			0x19,
			0xda,
			0x8e,
			0x94,
			0x5b,
			0x55,
			0x5a
		]);
		const result = dynamicTruncation(hmacArray, 6);
		expect(result).toBe('872921');
	});

	test('should correctly truncate HMAC array with 8 digits', () => {
		const hmacArray = new Uint8Array([
			0x1f,
			0x86,
			0x98,
			0x69,
			0x0e,
			0x02,
			0xca,
			0x16,
			0x61,
			0x85,
			0x50,
			0xef,
			0x7f,
			0x19,
			0xda,
			0x8e,
			0x94,
			0x5b,
			0x55,
			0x5a
		]);
		const result = dynamicTruncation(hmacArray, 8);
		expect(result).toBe('57872921');
	});

	test('should pad with leading zeros when result is shorter than digits', () => {
		// Create HMAC array that will produce a small number
		const hmacArray = new Uint8Array([
			0x00,
			0x00,
			0x00,
			0x00,
			0x00,
			0x00,
			0x00,
			0x00,
			0x00,
			0x00,
			0x00,
			0x00,
			0x00,
			0x00,
			0x00,
			0x00,
			0x00,
			0x00,
			0x00,
			0x01
		]);
		const result = dynamicTruncation(hmacArray, 6);
		// Should pad to 6 digits
		expect(result).toHaveLength(6);
		expect(result).toMatch(/^0+\d*$/);
	});

	test('should handle different offset values correctly', () => {
		// Test with offset 0 (last byte & 0x0f = 0)
		const hmacArray1 = new Uint8Array([
			0x12,
			0x34,
			0x56,
			0x78,
			0x9a,
			0xbc,
			0xde,
			0xf0,
			0x11,
			0x22,
			0x33,
			0x44,
			0x55,
			0x66,
			0x77,
			0x88,
			0x99,
			0xaa,
			0xbb,
			0x00 // offset = 0
		]);
		const result1 = dynamicTruncation(hmacArray1, 6);
		expect(result1).toHaveLength(6);

		// Test with offset 15 (last byte & 0x0f = 15)
		const hmacArray2 = new Uint8Array([
			0x12,
			0x34,
			0x56,
			0x78,
			0x9a,
			0xbc,
			0xde,
			0xf0,
			0x11,
			0x22,
			0x33,
			0x44,
			0x55,
			0x66,
			0x77,
			0x88,
			0x99,
			0xaa,
			0xbb,
			0x0f // offset = 15
		]);
		const result2 = dynamicTruncation(hmacArray2, 6);
		expect(result2).toHaveLength(6);
	});

	test('should work with different digit lengths', () => {
		const hmacArray = new Uint8Array([
			0x1f,
			0x86,
			0x98,
			0x69,
			0x0e,
			0x02,
			0xca,
			0x16,
			0x61,
			0x85,
			0x50,
			0xef,
			0x7f,
			0x19,
			0xda,
			0x8e,
			0x94,
			0x5b,
			0x55,
			0x5a
		]);

		// Test different digit lengths
		const result4 = dynamicTruncation(hmacArray, 4);
		expect(result4).toHaveLength(4);
		expect(result4).toBe('2921');

		const result5 = dynamicTruncation(hmacArray, 5);
		expect(result5).toHaveLength(5);
		expect(result5).toBe('72921');

		const result7 = dynamicTruncation(hmacArray, 7);
		expect(result7).toHaveLength(7);
		expect(result7).toBe('7872921');
	});

	test('should handle edge case with minimum valid HMAC array', () => {
		// Minimum array size needed (offset can be max 15, need 4 bytes from offset)
		const hmacArray = new Uint8Array(20).fill(0x00);
		hmacArray[19] = 0x0f; // offset = 15, points to index 15-18
		hmacArray[15] = 0x12;
		hmacArray[16] = 0x34;
		hmacArray[17] = 0x56;
		hmacArray[18] = 0x78;

		const result = dynamicTruncation(hmacArray, 6);
		expect(result).toHaveLength(6);
		expect(result).toMatch(/^\d{6}$/);
	});

	test('should return consistent results for same input', () => {
		const hmacArray = new Uint8Array([
			0x1f,
			0x86,
			0x98,
			0x69,
			0x0e,
			0x02,
			0xca,
			0x16,
			0x61,
			0x85,
			0x50,
			0xef,
			0x7f,
			0x19,
			0xda,
			0x8e,
			0x94,
			0x5b,
			0x55,
			0x5a
		]);

		const result1 = dynamicTruncation(hmacArray, 6);
		const result2 = dynamicTruncation(hmacArray, 6);
		const result3 = dynamicTruncation(hmacArray, 6);

		expect(result1).toBe(result2);
		expect(result2).toBe(result3);
		expect(result1).toBe('872921');
	});

	test('should mask the most significant bit correctly', () => {
		// Test that the MSB is properly masked (& 0x7f)
		const hmacArray = new Uint8Array([
			0xff,
			0xff,
			0xff,
			0xff,
			0xff,
			0xff,
			0xff,
			0xff,
			0xff,
			0xff,
			0xff,
			0xff,
			0xff,
			0xff,
			0xff,
			0xff,
			0xff,
			0xff,
			0xff,
			0x00 // offset = 0
		]);

		const result = dynamicTruncation(hmacArray, 6);
		expect(result).toHaveLength(6);
		// Should not have negative number issues due to MSB masking
		expect(result).toMatch(/^\d{6}$/);
	});
});
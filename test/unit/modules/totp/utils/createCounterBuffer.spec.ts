import { describe, test, expect } from 'bun:test';

import { createCounterBuffer } from '#/modules/totp/utils/createCounterBuffer';

describe('createCounterBuffer', () => {
	test('should create an 8-byte buffer from bigint counter', () => {
		const counter = 1n;
		const buffer = createCounterBuffer(counter);
		const view = new Uint8Array(buffer);
		const expected = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]);

		expect(buffer).toBeInstanceOf(ArrayBuffer);
		expect(buffer.byteLength).toBe(8);
		expect(view).toEqual(expected);
	});

	test('should create an 8-byte buffer from number counter', () => {
		const counter = 1;
		const buffer = createCounterBuffer(counter);
		const view = new Uint8Array(buffer);
		const expected = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]);

		expect(buffer).toBeInstanceOf(ArrayBuffer);
		expect(buffer.byteLength).toBe(8);
		expect(view).toEqual(expected);
	});

	test('should handle larger bigint values correctly', () => {
		const counter = 0x123456789ABCDEFn;
		const buffer = createCounterBuffer(counter);
		const view = new Uint8Array(buffer);
		const expected = new Uint8Array([0x01, 0x23, 0x45, 0x67, 0x89, 0xAB, 0xCD, 0xEF]);

		expect(view).toEqual(expected);
	});

	test('should handle larger number values correctly', () => {
		const counter = 0x12345678;
		const buffer = createCounterBuffer(counter);
		const view = new Uint8Array(buffer);
		// For a 32-bit number, the first 4 bytes should be 0, and the last 4 bytes should contain the value
		const expected = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78]);

		expect(view).toEqual(expected);
	});

	test('should handle zero values', () => {
		const bufferFromBigint = createCounterBuffer(0n);
		const bufferFromNumber = createCounterBuffer(0);
		const expected = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);

		expect(new Uint8Array(bufferFromBigint)).toEqual(expected);
		expect(new Uint8Array(bufferFromNumber)).toEqual(expected);
	});
});
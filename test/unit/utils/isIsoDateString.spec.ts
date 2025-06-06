import { describe, test, expect } from 'bun:test';

import { isIsoDateString } from '#/utils/isIsoDateString';

describe('isIsoDateString', () => {
    test('valid ISO date string', () => {
        expect(isIsoDateString('2023-10-01T12:00:00Z')).toBe(true);
    });

    test('invalid date string', () => {
        expect(isIsoDateString('invalid-date')).toBe(false);
    });

    test('number input', () => {
        expect(isIsoDateString(12345)).toBe(false);
    });

    test('valid ISO date from Date object', () => {
        expect(isIsoDateString(new Date().toISOString())).toBe(true);
    });

    test('empty string', () => {
        expect(isIsoDateString('')).toBe(false);
    });

    test('null input', () => {
        expect(isIsoDateString(null)).toBe(false);
    });

    test('undefined input', () => {
        expect(isIsoDateString(undefined)).toBe(false);
    });
});
import { describe, expect, test } from 'bun:test';

import { CoreError, type CoreErrorOptions } from '#/error/coreError.ts';


describe('CoreError', () => {
    describe('constructor', () => {
        test('should create a new CoreError instance with specific properties when valid options are provided', () => {
            const coreErrorOptions: CoreErrorOptions<{ token: string }> = {
                key: ['error.core-helper.example', 500],
                cause: { token: 'invalidToken' }
            };
            const coreError = new CoreError<{ token: string }>(coreErrorOptions);
            expect(coreError).toBeInstanceOf(CoreError);
            expect(coreError).toHaveProperty('cause', { token: 'invalidToken' });
            expect(coreError).toHaveProperty('code', 500);
            expect(coreError).toHaveProperty('column');
            expect(coreError).toHaveProperty('date');
            expect(coreError).toHaveProperty('fileName');
            expect(coreError).toHaveProperty('line');
            expect(coreError).toHaveProperty('message', 'error.core-helper.example');
            expect(coreError).toHaveProperty('name', 'CoreError');
            expect(coreError).toHaveProperty('stack');
            expect(coreError).toHaveProperty('uuidError');
        });

        test('should create a new CoreError instance with default code and message when key is undefined', () => {
            const coreError: CoreError = new CoreError();
            expect(coreError).toBeInstanceOf(CoreError);
            expect(coreError).toHaveProperty('cause', undefined);
            expect(coreError).toHaveProperty('code', 500);
            expect(coreError).toHaveProperty('column');
            expect(coreError).toHaveProperty('date');
            expect(coreError).toHaveProperty('fileName');
            expect(coreError).toHaveProperty('line');
            expect(coreError).toHaveProperty('message', 'error.unknown');
            expect(coreError).toHaveProperty('name', 'CoreError');
            expect(coreError).toHaveProperty('stack');
            expect(coreError).toHaveProperty('uuidError');
        });

        test('should provide a stack trace when the error is thrown', () => {
            try {
                throw new CoreError();
            } catch (error) {
                expect(error).toBeInstanceOf(CoreError);
                if (error instanceof CoreError) {
                    expect(error.stack).toBeDefined();
                    expect(error.stack).toContain('CoreError');
                }
            }
        });

        test('should include fileName, line, and column information if available', () => {
            try {
                throw new CoreError();
            } catch (error) {
                expect(error).toBeInstanceOf(CoreError);
                if (error instanceof CoreError) {
                    expect(error.fileName).toBeDefined();
                    expect(error.line).toBeDefined();
                    expect(error.column).toBeDefined();
                    expect(typeof error.fileName).toBe('string');
                    expect(typeof error.line).toBe('number');
                    expect(typeof error.column).toBe('number');
                }
            }
        });
    });
});

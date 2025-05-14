import { describe, expect, test } from 'bun:test';

import { CoreError } from '#/error/coreError';

describe('CoreError', () => {
    describe('constructor', () => {
        test('should create a new CoreError instance with specific properties when valid options are provided', () => {
            const coreError = new CoreError<{ eg: string }>({
                message: 'An example error',
                key: 'error.core-package.example',
                httpStatusCode: 123,
                cause: { eg: 'example' }
            });
            expect(coreError).toBeInstanceOf(CoreError);
            expect(coreError).toHaveProperty('uuid');
            expect(coreError).toHaveProperty('date');
            expect(coreError).toHaveProperty('key', 'error.core-package.example');
            expect(coreError).toHaveProperty('httpStatusCode', 123);
            expect(coreError).toHaveProperty('cause', { eg: 'example' });
            expect(coreError).toHaveProperty('message', 'An example error');
            expect(coreError).toHaveProperty('name', 'CoreError');
            expect(coreError).toHaveProperty('stack');
        });

        test('should create a new CoreError instance with default properties when no options are provided', () => {
            const coreError = new CoreError();
            expect(coreError).toBeInstanceOf(CoreError);
            expect(coreError).toHaveProperty('uuid');
            expect(coreError).toHaveProperty('date');
            expect(coreError).toHaveProperty('key', '');
            expect(coreError).toHaveProperty('httpStatusCode', 500);
            expect(coreError).toHaveProperty('cause', undefined);
            expect(coreError).toHaveProperty('message', '');
            expect(coreError).toHaveProperty('name', 'CoreError');
            expect(coreError).toHaveProperty('stack');
        });
    });
});

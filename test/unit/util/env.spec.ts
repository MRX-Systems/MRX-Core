import { type TSchema, Type } from '@sinclair/typebox';
import { describe, expect, test } from 'bun:test';

import { CoreError } from '#/error/coreError';
import { validateEnv } from '#/utils/env';

describe('validateEnv', () => {
    test('should throw an error if the environment variables are invalid based on the schema', () => {
        const schema: TSchema = Type.Object({
            PORT: Type.Number()
        });
        const env = {
            PORT: 'not a number'
        };

        expect(() => validateEnv(schema, env)).toThrowError(CoreError);
    });

    test('should not throw an error if the environment variables are valid based on the schema', () => {
        const schema: TSchema = Type.Object({
            PORT: Type.Number()
        });
        const env = {
            PORT: 3000
        };

        expect(() => validateEnv(schema, env)).not.toThrowError();
    });
});
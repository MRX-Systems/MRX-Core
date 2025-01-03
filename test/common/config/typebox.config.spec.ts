import { TSchema, Type } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { beforeAll, beforeEach, describe, expect, test } from 'bun:test';

import { TypeBoxConfig } from '../../../source/common/config/typebox.config.ts';

describe('TypeBoxConfig', () => {
    beforeAll(() => {
        TypeBoxConfig.init();
    });
    describe('init', () => {
        test('should set the default error function [ArrayContains]', () => {
            const schema: TSchema = Type.Object({
                array: Type.Array(Type.String(), {
                    contains: Type.Literal('zz')
                })
            });
            expect(() => Value.Assert(schema, { array: ['aa', 'bb', 'cc'] })).toThrow('error.core.validation.array.contains');
        });

        test('should set the default error function [ArrayMaxContains]', () => {
            const schema: TSchema = Type.Object({
                array: Type.Array(Type.String(), {
                    contains: Type.Literal('zz'),
                    maxContains: 2,
                })
            });
            expect(() => Value.Assert(schema, { array: ['zz', 'zz', 'zz'] })).toThrow('error.core.validation.array.max_contains');
        });

        test('should set the default error function [ArrayMaxItems]', () => {
            const schema: TSchema = Type.Object({
                array: Type.Array(Type.String(), {
                    maxItems: 2
                })
            });
            expect(() => Value.Assert(schema, { array: ['aa', 'bb', 'cc'] })).toThrow('error.core.validation.array.max_items');
        });

        test('should set the default error function [ArrayMinContains]', () => {
            const schema: TSchema = Type.Object({
                array: Type.Array(Type.String(), {
                    contains: Type.Literal('zz'),
                    minContains: 2
                })
            });
            expect(() => Value.Assert(schema, { array: ['zz'] })).toThrow('error.core.validation.array.min_contains');
        });

        test('should set the default error function [ArrayMinItems]', () => {
            const schema: TSchema = Type.Object({
                array: Type.Array(Type.String(), {
                    minItems: 2
                })
            });
            expect(() => Value.Assert(schema, { array: ['aa'] })).toThrow('error.core.validation.array.min_items');
        });

        test('should set the default error function [ArrayUniqueItems]', () => {
            const schema: TSchema = Type.Object({
                array: Type.Array(Type.String(), {
                    uniqueItems: true
                })
            });
            expect(() => Value.Assert(schema, { array: ['aa', 'aa'] })).toThrow('error.core.validation.array.unique_items');
        });

        test('should set the default error function [Array]', () => {
            const schema: TSchema = Type.Object({
                array: Type.Array(Type.String())
            });
            expect(() => Value.Assert(schema, { array: 'az' })).toThrow('error.core.validation.array.is_array');
        });

        test('should set the default error function [AsyncIterator]', () => {
            const schema: TSchema = Type.Object({
                asyncIterator: Type.AsyncIterator(Type.String())
            });
            expect(() => Value.Assert(schema, { asyncIterator: 'az' })).toThrow('error.core.validation.async_iterator.is_async_iterator');
        });

        test('should set the default error function [BigIntExclusiveMaximum]', () => {
            const schema: TSchema = Type.Object({
                bigint: Type.BigInt({
                    exclusiveMaximum: 10n
                })
            });
            expect(() => Value.Assert(schema, { bigint: 10n })).toThrow('error.core.validation.bigint.exclusive_maximum');
        });

        test('should set the default error function [BigIntExclusiveMinimum]', () => {
            const schema: TSchema = Type.Object({
                bigint: Type.BigInt({
                    exclusiveMinimum: 10n
                })
            });
            expect(() => Value.Assert(schema, { bigint: 10n })).toThrow('error.core.validation.bigint.exclusive_minimum');
        });

        test('should set the default error function [BigIntMaximum]', () => {
            const schema: TSchema = Type.Object({
                bigint: Type.BigInt({
                    maximum: 10n
                })
            });
            expect(() => Value.Assert(schema, { bigint: 11n })).toThrow('error.core.validation.bigint.maximum');
        });

        test('should set the default error function [BigIntMinimum]', () => {
            const schema: TSchema = Type.Object({
                bigint: Type.BigInt({
                    minimum: 10n
                })
            });
            expect(() => Value.Assert(schema, { bigint: 9n })).toThrow('error.core.validation.bigint.minimum');
        });

        test('should set the default error function [BigIntMultipleOf]', () => {
            const schema: TSchema = Type.Object({
                bigint: Type.BigInt({
                    multipleOf: 10n
                })
            });
            expect(() => Value.Assert(schema, { bigint: 11n })).toThrow('error.core.validation.bigint.multiple_of');
        });

        test('should set the default error function [BigInt]', () => {
            const schema: TSchema = Type.Object({
                bigint: Type.BigInt()
            });
            expect(() => Value.Assert(schema, { bigint: 11 })).toThrow('error.core.validation.bigint.is_bigint');
        });

        test('should set the default error function [Boolean]', () => {
            const schema: TSchema = Type.Object({
                boolean: Type.Boolean()
            });
            expect(() => Value.Assert(schema, { boolean: 'az' })).toThrow('error.core.validation.boolean.is_boolean');
        });

        test('should set the default error function [DateExclusiveMinimumTimestamp]', () => {
            const schema: TSchema = Type.Object({
                date: Type.Date({
                    exclusiveMinimumTimestamp: new Date('2022-01-01T00:00:00Z').getTime()
                })
            });
            expect(() => Value.Assert(schema, { date: new Date('2021-01-01T00:00:00Z') })).toThrow('error.core.validation.date.exclusive_minimum_timestamp');
        });

        test('should set the default error function [DateExclusiveMaximumTimestamp]', () => {
            const schema: TSchema = Type.Object({
                date: Type.Date({
                    exclusiveMaximumTimestamp: new Date('2022-01-01T00:00:00Z').getTime()
                })
            });
            expect(() => Value.Assert(schema, { date: new Date('2023-01-01T00:00:00Z') })).toThrow('error.core.validation.date.exclusive_maximum_timestamp');
        });

        test('should set the default error function [DateMinimumTimestamp]', () => {
            const schema: TSchema = Type.Object({
                date: Type.Date({
                    minimumTimestamp: new Date('2022-01-01T00:00:00Z').getTime()
                })
            });
            expect(() => Value.Assert(schema, { date: new Date('2021-01-01T00:00:00Z') })).toThrow('error.core.validation.date.minimum_timestamp');
        });

        test('should set the default error function [DateMaximumTimestamp]', () => {
            const schema: TSchema = Type.Object({
                date: Type.Date({
                    maximumTimestamp: new Date('2022-01-01T00:00:00Z').getTime()
                })
            });
            expect(() => Value.Assert(schema, { date: new Date('2023-01-01T00:00:00Z') })).toThrow('error.core.validation.date.maximum_timestamp');
        });

        test.todo('should set the default error function [DateMultipleOfTimestamp]', () => {
            const schema: TSchema = Type.Object({
                date: Type.Date({
                    multipleOfTimestamp: 1000
                })
            });
            expect(() => Value.Assert(schema, { date: new Date('2022-03-01T00:00:01Z') })).toThrow('error.core.validation.date.multiple_of_timestamp');
        });

        test('should set the default error function [Date]', () => {
            const schema: TSchema = Type.Object({
                date: Type.Date()
            });
            expect(() => Value.Assert(schema, { date: 'az' })).toThrow('error.core.validation.date.is_date');
        });

        test('should set the default error function [Function]', () => {
            const schema: TSchema = Type.Object({
                func: Type.Function(
                    [Type.String()],
                    Type.String()
                )
            });
            expect(() => Value.Assert(schema, { func: 'az' })).toThrow('error.core.validation.function.is_function');
        });

        test('should set the default error function [IntegerExclusiveMaximum]', () => {
            const schema: TSchema = Type.Object({
                integer: Type.Integer({
                    exclusiveMaximum: 10
                })
            });
            expect(() => Value.Assert(schema, { integer: 10 })).toThrow('error.core.validation.integer.exclusive_maximum');
        });

        test('should set the default error function [IntegerExclusiveMinimum]', () => {
            const schema: TSchema = Type.Object({
                integer: Type.Integer({
                    exclusiveMinimum: 10
                })
            });
            expect(() => Value.Assert(schema, { integer: 10 })).toThrow('error.core.validation.integer.exclusive_minimum');
        });

        test('should set the default error function [IntegerMaximum]', () => {
            const schema: TSchema = Type.Object({
                integer: Type.Integer({
                    maximum: 10
                })
            });
            expect(() => Value.Assert(schema, { integer: 11 })).toThrow('error.core.validation.integer.maximum');
        });

        test('should set the default error function [IntegerMinimum]', () => {
            const schema: TSchema = Type.Object({
                integer: Type.Integer({
                    minimum: 10
                })
            });
            expect(() => Value.Assert(schema, { integer: 9 })).toThrow('error.core.validation.integer.minimum');
        });

        test('should set the default error function [IntegerMultipleOf]', () => {
            const schema: TSchema = Type.Object({
                integer: Type.Integer({
                    multipleOf: 10
                })
            });
            expect(() => Value.Assert(schema, { integer: 11 })).toThrow('error.core.validation.integer.multiple_of');
        });

        test('should set the default error function [Integer]', () => {
            const schema: TSchema = Type.Object({
                integer: Type.Integer()
            });
            expect(() => Value.Assert(schema, { integer: 'az' })).toThrow('error.core.validation.integer.is_integer');
        });

        test('should set the default error function [IntersectUnevaluatedProperties]', () => {
            const schema: TSchema = Type.Object({
                intersect: Type.Intersect([
                    Type.Object({
                        a: Type.String(),
                    }),
                    Type.Object({
                        b: Type.String(),
                    }),
                ], { unevaluatedProperties: false })
            });
            expect(() => Value.Assert(schema, { intersect: { a: 'a', b: 'b', c: 'c' } })).toThrow('error.core.validation.intersect.unevaluated_properties');
        });

        test('should set the default error function [Intersect]', () => {
            const schema: TSchema = Type.Object({
                intersect: Type.Intersect([
                    Type.Object({
                        a: Type.String(),
                    }),
                    Type.Object({
                        b: Type.String(),
                    }),
                ])
            });
            const error = [...Value.Errors(schema, { intersect: {} })];
            const lastError = error[error.length - 1];
            expect(lastError.message).toBe('error.core.validation.intersect.is_intersect');
        });

        test('should set the default error function [Iterator]', () => {
            const schema: TSchema = Type.Object({
                iterator: Type.Iterator(Type.String())
            });
            expect(() => Value.Assert(schema, { iterator: 'az' })).toThrow('error.core.validation.iterator.is_iterator');
        });

        test('should set the default error function [Literal]', () => {
            const schema: TSchema = Type.Object({
                literal: Type.Literal('az')
            });
            expect(() => Value.Assert(schema, { literal: 'zz' })).toThrow('error.core.validation.literal.is_literal');
        });

        test('should set the default error function [Never]', () => {
            const schema: TSchema = Type.Object({
                never: Type.Never()
            });
            expect(() => Value.Assert(schema, { never: 'zz' })).toThrow('error.core.validation.never.is_never');
        });

        test('should set the default error function [Not]', () => {
            const schema: TSchema = Type.Object({
                not: Type.Not(Type.String())
            });
            expect(() => Value.Assert(schema, { not: 'zz' })).toThrow('error.core.validation.not.not_match');
        });

        test('should set the default error function [Null]', () => {
            const schema: TSchema = Type.Object({
                null: Type.Null()
            });
            expect(() => Value.Assert(schema, { null: 'zz' })).toThrow('error.core.validation.null.is_null');
        });

        test('should set the default error function [NumberExclusiveMaximum]', () => {
            const schema: TSchema = Type.Object({
                number: Type.Number({
                    exclusiveMaximum: 10
                })
            });
            expect(() => Value.Assert(schema, { number: 10 })).toThrow('error.core.validation.number.exclusive_maximum');
        });

        test('should set the default error function [NumberExclusiveMinimum]', () => {
            const schema: TSchema = Type.Object({
                number: Type.Number({
                    exclusiveMinimum: 10
                })
            });
            expect(() => Value.Assert(schema, { number: 10 })).toThrow('error.core.validation.number.exclusive_minimum');
        });

        test('should set the default error function [NumberMaximum]', () => {
            const schema: TSchema = Type.Object({
                number: Type.Number({
                    maximum: 10
                })
            });
            expect(() => Value.Assert(schema, { number: 11 })).toThrow('error.core.validation.number.maximum');
        });

        test('should set the default error function [NumberMinimum]', () => {
            const schema: TSchema = Type.Object({
                number: Type.Number({
                    minimum: 10
                })
            });
            expect(() => Value.Assert(schema, { number: 9 })).toThrow('error.core.validation.number.minimum');
        });

        test('should set the default error function [NumberMultipleOf]', () => {
            const schema: TSchema = Type.Object({
                number: Type.Number({
                    multipleOf: 10
                })
            });
            expect(() => Value.Assert(schema, { number: 11 })).toThrow('error.core.validation.number.multiple_of');
        });

        test('should set the default error function [Number]', () => {
            const schema: TSchema = Type.Object({
                number: Type.Number()
            });
            expect(() => Value.Assert(schema, { number: 'az' })).toThrow('error.core.validation.number.is_number');
        });

        test('should set the default error function [Object]', () => {
            const schema: TSchema = Type.Object({
                object: Type.Object({})
            });
            expect(() => Value.Assert(schema, { object: 'az' })).toThrow('error.core.validation.object.is_object');
        });

        test('should set the default error function [ObjectAdditionalProperties]', () => {
            const schema: TSchema = Type.Object({
                object: Type.Object({
                    a: Type.String(),
                }, { additionalProperties: false })
            });
            expect(() => Value.Assert(schema, { object: { a: 'a', b: 'b' } })).toThrow('error.core.validation.object.additional_properties');
        });

        test('should set the default error function [ObjectMaxProperties]', () => {
            const schema: TSchema = Type.Object({
                object: Type.Object({}, { maxProperties: 2 })
            });
            expect(() => Value.Assert(schema, { object: { a: 'a', b: 'b', c: 'c' } })).toThrow('error.core.validation.object.max_properties');
        });

        test('should set the default error function [ObjectMinProperties]', () => {
            const schema: TSchema = Type.Object({
                object: Type.Object({}, { minProperties: 2 })
            });
            expect(() => Value.Assert(schema, { object: { a: 'a' } })).toThrow('error.core.validation.object.min_properties');
        });

        test('should set the default error function [ObjectRequiredProperty]', () => {
            const schema: TSchema = Type.Object({
                object: Type.Object({
                    a: Type.String(),
                    b: Type.String(),
                }, { required: ['a', 'b'] })
            });
            expect(() => Value.Assert(schema, { object: { a: 'a' } })).toThrow('error.core.validation.object.required_property');
        });

        test('should set the default error function [Promise]', () => {
            const schema: TSchema = Type.Object({
                promise: Type.Promise(Type.String())
            });
            expect(() => Value.Assert(schema, { promise: 'az' })).toThrow('error.core.validation.promise.is_promise');
        });

        test('should set the default error function [RegExp]', () => {
            const schema: TSchema = Type.Object({
                regexp: Type.RegExp(/^[a-z]+$/)
            });
            expect(() => Value.Assert(schema, { regexp: '123' })).toThrow('error.core.validation.regexp.not_match');
        });

        test('should set the default error function [StringFormatUnknown]', () => {
            const schema: TSchema = Type.Object({
                string: Type.String({
                    format: 'unknown'
                })
            });
            expect(() => Value.Assert(schema, { string: 'az' })).toThrow('error.core.validation.string.format_unknown');
        });

        test('should set the default error function [StringFormat]', () => {
            const schema: TSchema = Type.Object({
                string: Type.String({
                    format: 'password'
                })
            });
            expect(() => Value.Assert(schema, { string: 'az' })).toThrow('error.core.validation.string.format');
        });

        test('should set the default error function [StringMaxLength]', () => {
            const schema: TSchema = Type.Object({
                string: Type.String({
                    maxLength: 2
                })
            });
            expect(() => Value.Assert(schema, { string: 'aaa' })).toThrow('error.core.validation.string.max_length');
        });

        test('should set the default error function [StringMinLength]', () => {
            const schema: TSchema = Type.Object({
                string: Type.String({
                    minLength: 2
                })
            });
            expect(() => Value.Assert(schema, { string: 'a' })).toThrow('error.core.validation.string.min_length');
        });

        test('should set the default error function [StringPattern]', () => {
            const schema: TSchema = Type.Object({
                string: Type.String({
                    pattern: '^[a-z]+$'
                })
            });
            expect(() => Value.Assert(schema, { string: '123' })).toThrow('error.core.validation.string.pattern');
        });

        test('should set the default error function [String]', () => {
            const schema: TSchema = Type.Object({
                string: Type.String()
            });
            expect(() => Value.Assert(schema, { string: 11 })).toThrow('error.core.validation.string.is_string');
        });

        test('should set the default error function [Symbol]', () => {
            const schema: TSchema = Type.Object({
                symbol: Type.Symbol()
            });
            expect(() => Value.Assert(schema, { symbol: 'az' })).toThrow('error.core.validation.symbol.is_symbol');
        });

        test('should set the default error function [TupleLength]', () => {
            const schema: TSchema = Type.Tuple([Type.String()]);
            expect(() => Value.Assert(schema, ['a', 'b'])).toThrow('error.core.validation.tuple.length');
        });

        test('should set the default error function [Tuple]', () => {
            const schema: TSchema = Type.Tuple([Type.String(), Type.String()]);
            expect(() => Value.Assert(schema, 'az')).toThrow('error.core.validation.tuple.is_tuple');
        });

        test('should set the default error function [Uint8ArrayMaxByteLength]', () => {
            const schema: TSchema = Type.Object({
                uint8Array: Type.Uint8Array({ maxByteLength: 2 })
            });
            expect(() => Value.Assert(schema, { uint8Array: new Uint8Array(3) })).toThrow('error.core.validation.uint8array.max_byte_length');
        });

        test('should set the default error function [Uint8ArrayMinByteLength]', () => {
            const schema: TSchema = Type.Object({
                uint8Array: Type.Uint8Array({ minByteLength: 2 })
            });
            expect(() => Value.Assert(schema, { uint8Array: new Uint8Array(1) })).toThrow('error.core.validation.uint8array.min_byte_length');
        });

        test('should set the default error function [Uint8Array]', () => {
            const schema: TSchema = Type.Object({
                uint8Array: Type.Uint8Array()
            });
            expect(() => Value.Assert(schema, { uint8Array: 'az' })).toThrow('error.core.validation.uint8array.is_uint8array');
        });

        test('should set the default error function [Undefined]', () => {
            const schema: TSchema = Type.Object({
                undefined: Type.Undefined()
            });
            expect(() => Value.Assert(schema, { undefined: 'az' })).toThrow('error.core.validation.undefined.is_undefined');
        });

        test('should set the default error function [Union]', () => {
            const schema: TSchema = Type.Union([Type.String(), Type.Number()]);
            expect(() => Value.Assert(schema, { union: 'az' })).toThrow('error.core.validation.union.is_union');
        });

        test('should set the default error function [Void]', () => {
            const schema: TSchema = Type.Object({
                void: Type.Void()
            });
            expect(() => Value.Assert(schema, { void: 'az' })).toThrow('error.core.validation.void.is_void');
        });
    });

    describe('registerFormat', () => {
        beforeEach(() => {
            if (TypeBoxConfig.hasFormat('email'))
                TypeBoxConfig.unregisterFormat('email');
        });

        test('should add a new format with default message', () => {
            TypeBoxConfig.registerFormat('email', (value: string): boolean => {
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                return emailRegex.test(value);
            });
            const schema: TSchema = Type.Object({
                email: Type.String({ format: 'email' })
            });
            expect(() => Value.Assert(schema, { email: 'az' })).toThrow('error.core.validation.string.format');
        });

        test('should add a new format with custom message', () => {
            TypeBoxConfig.registerFormat('email', (value: string): boolean => {
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                return emailRegex.test(value);
            }, 'error.validation.format.email');
            const schema: TSchema = Type.Object({
                email: Type.String({ format: 'email' })
            });
            expect(() => Value.Assert(schema, { email: 'az' })).toThrow('error.validation.format.email');
        });

        test('should throw an error if the format already exists', () => {
            TypeBoxConfig.registerFormat('email', (value: string): boolean => {
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                return emailRegex.test(value);
            });
            expect(() => TypeBoxConfig.registerFormat('email', (): boolean => true)).toThrow('error.core.validation.format.already_exists');
        });
    });

    describe('unregisterFormat', () => {
        beforeEach(() => {
            if (TypeBoxConfig.hasFormat('email'))
                TypeBoxConfig.unregisterFormat('email');
        });

        test('should remove a format', () => {
            TypeBoxConfig.registerFormat('email', (value: string): boolean => {
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                return emailRegex.test(value);
            });
            TypeBoxConfig.unregisterFormat('email');
            const schema: TSchema = Type.Object({
                email: Type.String({ format: 'email' })
            });
            expect(() => Value.Assert(schema, { email: 'az' })).toThrow('error.core.validation.string.format');
            expect(TypeBoxConfig.formats).not.toContain('email');
        });

        test('should throw an error if the format does not exist', () => {
            expect(() => TypeBoxConfig.unregisterFormat('email')).toThrow('error.core.validation.format.does_not_exist');
        });
    });

    describe('formats', () => {
        test('should return all registered formats', () => {
            TypeBoxConfig.registerFormat('email', (value: string): boolean => {
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                return emailRegex.test(value);
            });
            expect(TypeBoxConfig.formats).toContain('email');
            TypeBoxConfig.unregisterFormat('email');
        });
    });
});
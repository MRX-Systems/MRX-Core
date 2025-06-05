import { describe, expect, test } from 'bun:test';
import { t } from 'elysia/type-system';

import { removeValidationFromSchema } from '#/utils/typebox/removeValidationFromSchema';

const stringOptions = {
    title: 'String type',
    description: 'This is a string type schema',
    minLength: 2,
    maxLength: 12,
    format: 'email',
    pattern: '^[a-zA-Z]+$',
    examples: ['example1', 'example2'],
    default: 'default string'
};

const numberOptions = {
    title: 'Number type',
    description: 'This is a number type schema',
    default: 42,
    minimum: 0,
    maximum: 100,
    exclusiveMinimum: 1,
    exclusiveMaximum: 99,
    multipleOf: 2,
    examples: [42, 84]
};

const integerOptions = {
    title: 'Integer type',
    description: 'This is an integer type schema',
    default: 10,
    minimum: 0,
    maximum: 100,
    exclusiveMinimum: 1,
    exclusiveMaximum: 99,
    multipleOf: 2,
    examples: [10, 20]
};

const booleanOptions = {
    title: 'Boolean type',
    description: 'This is a boolean type schema',
    default: true,
    examples: [true, false]
};

const arrayOptions = {
    title: 'Array',
    description: 'This is an array schema',
    examples: [['example1', 'example2']],
    default: ['default'],
    maxContains: 5,
    minContains: 1,
    uniqueItems: true,
    minItems: 1,
    maxItems: 10
};

const literalStringOptions = {
    title: 'Literal String',
    description: 'This is a literal string schema',
    examples: ['test'],
    default: 'test'
};

const literalNumberOptions = {
    title: 'Literal Number',
    description: 'This is a literal number schema',
    examples: [42],
    default: 42
};

const objectOptions = {
    title: 'Object',
    description: 'This is an object schema',
    examples: [{ field: 'value', nestedObject: { nestedField: 'nestedValue' } }],
    default: { field: 'default', nestedObject: { nestedField: 'defaultNested' } },
    minProperties: 1,
    maxProperties: 5
};

const unionOptions = {
    title: 'Union Type',
    description: 'This is a union type schema',
    examples: ['example1', 42],
    default: 'default union'
};

const tupleOptions = {
    title: 'Tuple Type',
    description: 'This is a tuple type schema',
    examples: [['example1', 42]],
    default: ['default string', 0]
};

const baseSchema = {
    unknown: t.Unknown({
        title: 'Unknown Type',
        description: 'This is an unknown type schema',
        examples: ['example1', 2],
        default: 'default unknown'
    }),
    string: t.String(stringOptions),
    number: t.Number(numberOptions),
    integer: t.Integer(integerOptions),
    boolean: t.Boolean(booleanOptions),
    null: t.Null({
        title: 'Null type',
        description: 'This is a null type schema',
        default: null,
        examples: [null]
    }),
    literalString: t.Literal('test', literalStringOptions),
    literalNumber: t.Literal(42, literalNumberOptions),
    array: t.Array(t.String(stringOptions), arrayOptions),
    object: t.Object({
        field: t.String(stringOptions),
        nestedObject: t.Object({
            nestedField: t.String(stringOptions)
        }, objectOptions)
    }, objectOptions),
    tuple: t.Tuple([
        t.String(stringOptions),
        t.Number(numberOptions)
    ]),
    const: t.Const({
        x: 1,
        y: 2
    }, {
        title: 'Const Object',
        description: 'This is a const object schema',
        examples: [{ x: 1, y: 2 }],
        default: { x: 1, y: 2 }
    }),
    keyOf: t.KeyOf(
        t.Object({
            a: t.String(literalStringOptions),
            b: t.Number(literalNumberOptions)
        })
    ),
    union: t.Union([t.String(literalStringOptions), t.Number(literalNumberOptions)], unionOptions),
    intersect: t.Intersect([
        t.Object({ a: t.String(literalStringOptions) }, objectOptions),
        t.Object({ b: t.Number(literalNumberOptions) }, objectOptions)
    ]),
    composite: t.Composite([
        t.Object({
            a: t.String(stringOptions)
        }, objectOptions),
        t.Object({
            b: t.Number(numberOptions)
        }, objectOptions)
    ], {
        title: 'Composite Type',
        description: 'This is a composite type schema',
        examples: [{ a: 'example', b: 42 }],
        default: { a: 'default', b: 0 },
        minProperties: 1,
        maxProperties: 5
    }),
    never: t.Never({
        title: 'Never Type',
        description: 'This is a never type schema',
        examples: [],
        default: undefined
    }),
    not: t.Not(t.String(stringOptions), {
        title: 'Not Type',
        description: 'This is a not type schema',
        examples: ['example1', 42],
        default: 'default not'
    }),
    exclude: t.Exclude(
        t.Union([t.String(stringOptions), t.Number(numberOptions)], unionOptions),
        t.String(stringOptions),
        {
            title: 'Exclude Type',
            description: 'This is an exclude type schema',
            examples: [42],
            default: 0
        }
    ),
    mapped: t.Mapped(
        t.Union([
            t.Literal('a', literalStringOptions),
            t.Literal('b', literalStringOptions)
        ]),
        () => t.Number(numberOptions),
        {
            title: 'Mapped Type',
            description: 'This is a mapped type schema',
            examples: [{ a: 1, b: 2 }],
            default: { a: 0, b: 0 },
            minProperties: 1,
            maxProperties: 5
        }
    ),
    templateLiteral: t.TemplateLiteral([
        t.Literal('on', literalStringOptions),
        t.Union([
            t.Literal('open', literalStringOptions),
            t.Literal('close', literalStringOptions)
        ], unionOptions)
    ], {
        title: 'Template Literal',
        description: 'This is a template literal schema',
        examples: ['onOpen', 'onClose'],
        default: 'onDefault'
    }),
    record: t.Record(
        t.String(stringOptions),
        t.Number(numberOptions),
        {
            title: 'Record Type',
            description: 'This is a record type schema',
            examples: [{ key1: 1, key2: 2 }],
            default: { key1: 0, key2: 0 },
            minProperties: 1,
            maxProperties: 5
        }
    ),
    partial: t.Partial(
        t.Object({
            a: t.String(stringOptions),
            b: t.Number(numberOptions)
        }, objectOptions),
        {
            title: 'Partial Type',
            description: 'This is a partial type schema',
            examples: [{ a: 'example', b: 42 }],
            default: { a: 'default', b: 0 }
        }
    ),
    required: t.Required(
        t.Partial(
            t.Object({
                a: t.String(stringOptions),
                b: t.Number(numberOptions)
            }, objectOptions),
            {
                title: 'Partial Type',
                description: 'This is a partial type schema',
                examples: [{ a: 'example', b: 42 }],
                default: { a: 'default', b: 0 }
            }
        ),
        {
            title: 'Required Type',
            description: 'This is a required type schema',
            examples: [{ a: 'example', b: 42 }],
            default: { a: 'default', b: 0 }
        }
    ),
    pick: t.Pick(
        t.Object({
            a: t.String(stringOptions),
            b: t.Number(numberOptions),
            c: t.Boolean(booleanOptions)
        }, objectOptions),
        ['a', 'b'],
        {
            title: 'Pick Type',
            description: 'This is a pick type schema',
            examples: [{ a: 'example', b: 42 }],
            default: { a: 'default', b: 0 }
        }
    ),
    rest: t.Tuple([
        ...t.Rest(
            t.Tuple([
                t.Literal('a', literalStringOptions),
                t.Literal('b', literalStringOptions)
            ], tupleOptions)
        ),
        ...t.Rest(
            t.Tuple([
                t.Literal('c', literalStringOptions),
                t.Literal('d', literalStringOptions)
            ], tupleOptions)
        )
    ], tupleOptions),
    uncapitalize: t.Uncapitalize(
        t.Literal('TestString', literalStringOptions),
        {
            title: 'Uncapitalize Type',
            description: 'This is an uncapitalize type schema',
            examples: ['teststring'],
            default: 'teststring'
        }
    ),
    capitalize: t.Capitalize(
        t.Literal('teststring', literalStringOptions),
        {
            title: 'Capitalize Type',
            description: 'This is a capitalize type schema',
            examples: ['Teststring'],
            default: 'Teststring'
        }
    ),
    uppercase: t.Uppercase(
        t.Literal('teststring', literalStringOptions),
        {
            title: 'Uppercase Type',
            description: 'This is an uppercase type schema',
            examples: ['TESTSTRING'],
            default: 'TESTSTRING'
        }
    ),
    lowercase: t.Lowercase(
        t.Literal('TESTSTRING', literalStringOptions),
        {
            title: 'Lowercase Type',
            description: 'This is a lowercase type schema',
            examples: ['teststring'],
            default: 'teststring'
        }
    ),
    ref: t.Ref('SomeRef', {
        title: 'Reference Type',
        description: 'This is a reference type schema',
        examples: ['example1', 42],
        default: 'default ref'
    }),
    constructor: t.Constructor([
        t.String(stringOptions),
        t.Number(numberOptions)
    ], t.Boolean(booleanOptions), {
        title: 'Constructor Type',
        description: 'This is a constructor type schema',
        examples: ['example1', 42],
        default: 'default constructor'
    }),
    function: t.Function([
        t.String(stringOptions),
        t.Number(numberOptions)
    ], t.Boolean(booleanOptions), {
        title: 'Function Type',
        description: 'This is a function type schema',
        examples: ['example1', 42],
        default: 'default function'
    }),
    promise: t.Promise(t.String(stringOptions), {
        title: 'Promise Type',
        description: 'This is a promise type schema',
        examples: ['example1', 'example2'],
        default: 'default promise'
    }),
    asyncIterator: t.AsyncIterator(t.String(stringOptions), {
        title: 'Async Iterator Type',
        description: 'This is an async iterator type schema',
        examples: ['example1', 'example2'],
        default: 'default async iterator'
    }),
    iterator: t.Iterator(t.String(stringOptions), {
        title: 'Iterator Type',
        description: 'This is an iterator type schema',
        examples: ['example1', 'example2'],
        default: 'default iterator'
    }),
    regexp: t.RegExp(/^[a-z]+$/, {
        title: 'RegExp Type',
        description: 'This is a RegExp type schema',
        examples: [/^[a-z]+$/],
        default: /^[a-z]+$/,
        minLength: 1,
        maxLength: 100
    }),
    uint8array: t.Uint8Array({
        title: 'Uint8Array Type',
        description: 'This is a Uint8Array type schema',
        examples: [new Uint8Array([1, 2, 3])],
        default: new Uint8Array([0]),
        minByteLength: 1,
        maxByteLength: 10
    }),
    date: t.Date({
        title: 'Date Type',
        description: 'This is a Date type schema',
        examples: [new Date('2023-01-01T00:00:00Z')],
        default: new Date('2023-01-01T00:00:00Z'),
        minimumTimestamp: new Date('2020-01-01T00:00:00Z').getTime(),
        maximumTimestamp: new Date('2025-01-01T00:00:00Z').getTime(),
        exclusiveMaximumTimestamp: new Date('2024-01-01T00:00:00Z').getTime(),
        exclusiveMinimumTimestamp: new Date('2021-01-01T00:00:00Z').getTime(),
        multipleOfTimestamp: 1000
    }),
    undefined: t.Undefined({
        title: 'Undefined Type',
        description: 'This is an undefined type schema',
        examples: [undefined],
        default: undefined
    }),
    symbol: t.Symbol({
        title: 'Symbol Type',
        description: 'This is a symbol type schema',
        examples: [Symbol('example')],
        default: Symbol('default')
    }),
    // bigInt: t.BigInt({
    //     title: 'BigInt Type',
    //     description: 'This is a BigInt type schema',
    //     examples: [BigInt(123)],
    //     default: BigInt(0),
    //     exclusiveMinimum: BigInt(1),
    //     exclusiveMaximum: BigInt(100),
    //     minimum: BigInt(0),
    //     maximum: BigInt(100),
    //     multipleOf: BigInt(2)
    // }),
    void: t.Void({
        title: 'Void Type',
        description: 'This is a void type schema',
        examples: [undefined],
        default: undefined
    })
};


const validationProperties: string[] = [
    'default',
    'minLength',
    'maxLength',
    'pattern',
    'format',
    'minimum',
    'maximum',
    'exclusiveMinimum',
    'exclusiveMaximum',
    'multipleOf',
    'minItems',
    'maxItems',
    'maxContains',
    'minContains',
    'minProperties',
    'maxProperties',
    'uniqueItems',
    'minimumTimestamp',
    'maximumTimestamp',
    'exclusiveMinimumTimestamp',
    'exclusiveMaximumTimestamp',
    'multipleOfTimestamp'
];

describe('removeValidationFromSchema', () => {
    test.each(Object.entries(baseSchema))('should remove validation properties from %s schema', (key, schema) => {
        const cleanedSchema = removeValidationFromSchema(schema);
        expect(cleanedSchema).toBeDefined();

        // find recursively if the cleanedSchema not contains any validation properties
        const findValidationProperties = (schema: Record<string, unknown>): string[] => {
            const foundProperties: string[] = [];

            const searchProperties = (obj: Record<string, unknown>, path: string[] = []) => {
                for (const prop in obj) {
                    const currentPath = [...path, prop];
                    if (validationProperties.includes(prop))
                        foundProperties.push(currentPath.join('.')); // Add full path of the property

                    const value = obj[prop];
                    if (typeof value === 'object' && value !== null)
                        searchProperties(value as Record<string, unknown>, currentPath);
                }
            };

            searchProperties(schema);
            return foundProperties;
        };

        const hasValidationProperties = findValidationProperties(cleanedSchema as Record<string, unknown>);
        expect(hasValidationProperties).toEqual([]);
    });
});
import { describe, expect, test } from 'bun:test';

import {
	filterByKeyExclusion,
	filterByKeyExclusionRecursive,
	filterByKeyInclusion,
	filterByValue,
	transformKeys
} from '#/modules/data/data';
import { DATA_ERROR_KEYS } from '#/modules/data/enums/data-error-keys';
import { CamelCaseTransformer } from '#/modules/data/transformers/camel-case';
import { KebabCaseTransformer } from '#/modules/data/transformers/kebab-case';
import { PascalCaseTransformer } from '#/modules/data/transformers/pascal-case';
import { SnakeCaseTransformer } from '#/modules/data/transformers/snake-case';

/**
 * Test data constants for consistent testing across all test suites.
 */
const testData = {
	SIMPLE_OBJECT: { test: 'test', exclude: 'exclude' } as const,
	OBJECT_WITH_NULLS: { test: 'test', exclude: null, exclude2: undefined } as const,
	COMPLEX_OBJECT: {
		stringValue: 'test',
		numberValue: 42,
		booleanValue: true,
		nullValue: null,
		undefinedValue: undefined,
		arrayValue: [1, 2, 3],
		nestedObject: { nested: 'value' }
	} as const,
	CASE_VARIANTS: {
		camelCase: 'myKeyName',
		PascalCase: 'MyKeyName',
		'kebab-case': 'my-key-name',
		snakeCase: 'my_key_name',
		'mixed-Case_example': 'mixed-Case_example'
	} as const
} as const;

/**
 * Error messages expected from the data functions.
 */
const expectedErrorMessages = {
	NULL_DATA: DATA_ERROR_KEYS.DATA_IS_NULL
} as const;

/**
 * Helper function to create a null object for testing error cases.
 * @returns A null value cast as Record<string, unknown> for testing purposes.
 */
const _createNullObject = (): Record<string, unknown> => null as unknown as Record<string, unknown>;

describe('filterByKeyExclusion', () => {
	describe('when filtering with key exclusion', () => {
		test('should return filtered object excluding specified keys', () => {
			const object: Record<string, string> = testData.SIMPLE_OBJECT;
			const filtered: Omit<typeof object, 'exclude'> = filterByKeyExclusion(object, ['exclude']);

			expect(filtered).toEqual({ test: 'test' });
			expect(filtered).not.toHaveProperty('exclude');
		});

		test('should exclude multiple keys when provided', () => {
			const object: Record<string, string | null | undefined> = {
				keep1: 'keep',
				keep2: 'keep',
				exclude1: 'remove',
				exclude2: 'remove'
			};
			const filteredData: Omit<typeof object, 'exclude1' | 'exclude2'> = filterByKeyExclusion(
				object,
				['exclude1', 'exclude2']
			);

			expect(filteredData).toEqual({ keep1: 'keep', keep2: 'keep' });
		});

		test('should handle complex objects while preserving values', () => {
			const filteredData: Omit<typeof testData.COMPLEX_OBJECT, 'nullValue' | 'undefinedValue'>
			= filterByKeyExclusion(testData.COMPLEX_OBJECT, ['nullValue', 'undefinedValue']);

			expect(filteredData).toEqual({
				stringValue: 'test',
				numberValue: 42,
				booleanValue: true,
				arrayValue: [1, 2, 3],
				nestedObject: { nested: 'value' }
			});
		});
	});

	describe('when excluding null and undefined values', () => {
		test('should exclude null and undefined values when flag is true', () => {
			const object: Record<string, string | null | undefined> = testData.OBJECT_WITH_NULLS;
			const filtered: Partial<typeof object> = filterByKeyExclusion(object, [], true);

			expect(filtered).toEqual({ test: 'test' });
			expect(filtered).not.toHaveProperty('exclude');
			expect(filtered).not.toHaveProperty('exclude2');
		});

		test('should combine key exclusion with null/undefined exclusion', () => {
			const object: Record<string, string | null | undefined> = {
				keep: 'keep',
				excludeKey: 'remove',
				nullValue: null,
				undefinedValue: undefined
			};
			const filteredData: Partial<Omit<typeof object, 'excludeKey'>>
			= filterByKeyExclusion(object, ['excludeKey'], true);

			expect(filteredData).toEqual({ keep: 'keep' });
		});
	});

	describe('when handling edge cases', () => {
		test('should return original object when keys array is empty', () => {
			const object: Record<string, string> = { test: 'test' };
			const filtered: typeof object = filterByKeyExclusion(object, []);

			expect(filtered).toEqual({ test: 'test' });
		});

		test('should return original object when specified keys are not found', () => {
			const object: Record<string, string> = { test: 'test' };
			const filtered: Omit<typeof object, 'nonExistent'> = filterByKeyExclusion(object, ['nonExistent']);

			expect(filtered).toEqual({ test: 'test' });
		});

		test('should handle empty object', () => {
			const object: Record<string, never> = {};
			const filtered: typeof object = filterByKeyExclusion(object, ['anyKey']);

			expect(filtered).toEqual({});
		});
	});

	describe('when handling error cases', () => {
		test('should throw error when data is null', () => {
			const nullObject: Record<string, unknown> = _createNullObject();

			expect(() => filterByKeyExclusion(nullObject, [])).toThrow(expectedErrorMessages.NULL_DATA);
		});
	});
});

describe('filterByKeyExclusionRecursive', () => {
	describe('when filtering with key exclusion recursively', () => {
		test('should return object excluding specified keys recursively', () => {
			const object = {
				a: 'test',
				b: 'exclude',
				nested: {
					a: 'nestedTest',
					b: 'nestedExclude',
					foo: {
						a: 'nested2Test',
						b: 'nested2Exclude'
					}
				},
				nested2: {
					a: 'nested3Test',
					b: 'nested3Exclude',
					nested3: {
						foo: 'nested4Test'
					},
					nested4: [
						{
							a: 'nested4Test',
							b: 'nested4Exclude',
							foo: 'nested4Foo'
						}
					]
				}
			};
			const filtered: Record<string, unknown> = filterByKeyExclusionRecursive(object, ['foo']);
			expect(filtered).toEqual({
				a: 'test',
				b: 'exclude',
				nested: {
					a: 'nestedTest',
					b: 'nestedExclude'
				},
				nested2: {
					a: 'nested3Test',
					b: 'nested3Exclude',
					nested3: {},
					nested4: [
						{
							a: 'nested4Test',
							b: 'nested4Exclude'
						}
					]
				}
			});

			const filtered2: Record<string, unknown> = filterByKeyExclusionRecursive(object, ['nested3']);
			expect(filtered2).toEqual({
				a: 'test',
				b: 'exclude',
				nested: {
					a: 'nestedTest',
					b: 'nestedExclude',
					foo: {
						a: 'nested2Test',
						b: 'nested2Exclude'
					}
				},
				nested2: {
					a: 'nested3Test',
					b: 'nested3Exclude',
					nested4: [
						{
							a: 'nested4Test',
							b: 'nested4Exclude',
							foo: 'nested4Foo'
						}
					]
				}
			});


			const filtered3: Record<string, unknown> = filterByKeyExclusionRecursive(object, ['a']);
			expect(filtered3).toEqual({
				b: 'exclude',
				nested: {
					b: 'nestedExclude',
					foo: {
						b: 'nested2Exclude'
					}
				},
				nested2: {
					b: 'nested3Exclude',
					nested3: {
						foo: 'nested4Test'
					},
					nested4: [
						{
							b: 'nested4Exclude',
							foo: 'nested4Foo'
						}
					]
				}
			});
		});

		test('should return object with all symbol of original object', () => {
			const object = { [Symbol.for('test')]: 'test' };
			const filtered: Record<string, unknown> = filterByKeyExclusionRecursive(object, []);
			expect(filtered).toEqual({ [Symbol.for('test')]: 'test' });
		});
	});
});

describe('filterByKeyInclusion', () => {
	describe('when filtering with key inclusion', () => {
		test('should return object with only specified keys', () => {
			const object: Record<string, string> = testData.SIMPLE_OBJECT;
			const filtered: Pick<typeof object, 'test'> = filterByKeyInclusion(object, ['test']);

			expect(filtered).toEqual({ test: 'test' });
			expect(filtered).not.toHaveProperty('exclude');
		});

		test('should include multiple keys when provided', () => {
			const object: Record<string, string> = {
				keep1: 'keep1',
				keep2: 'keep2',
				exclude1: 'exclude1',
				exclude2: 'exclude2'
			};
			const filtered: Pick<typeof object, 'keep1' | 'keep2'> = filterByKeyInclusion(
				object,
				['keep1', 'keep2']
			);

			expect(filtered).toEqual({ keep1: 'keep1', keep2: 'keep2' });
		});

		test('should handle complex objects with various data types', () => {
			const filteredData: Pick<typeof testData.COMPLEX_OBJECT, 'stringValue' | 'numberValue' | 'nestedObject'>
			= filterByKeyInclusion(testData.COMPLEX_OBJECT, ['stringValue', 'numberValue', 'nestedObject']);

			expect(filteredData).toEqual({
				stringValue: 'test',
				numberValue: 42,
				nestedObject: { nested: 'value' }
			});
		});
	});

	describe('when excluding null and undefined values', () => {
		test('should exclude null and undefined values when flag is true', () => {
			const object: Record<string, string | null | undefined> = testData.OBJECT_WITH_NULLS;
			const filtered: Partial<Pick<typeof object, 'test'>> = filterByKeyInclusion(object, ['test'], true);

			expect(filtered).toEqual({ test: 'test' });
		});

		test('should return empty object when included key has null/undefined value and flag is true', () => {
			const object: Record<string, string | null> = { test: 'test', nullKey: null };
			const filtered: Partial<Pick<typeof object, 'nullKey'>> = filterByKeyInclusion(object, ['nullKey'], true);

			expect(filtered).toEqual({});
		});
	});

	describe('when handling edge cases', () => {
		test('should return empty object when keys array is empty', () => {
			const object: Record<string, string> = { test: 'test' };
			const filtered: Pick<typeof object, never> = filterByKeyInclusion(object, []);

			expect(filtered).toEqual({});
		});

		test('should return empty object when specified keys are not found', () => {
			const object: Record<string, string> = { test: 'test' };
			const filtered: Pick<typeof object, never> = filterByKeyInclusion(object, ['nonExistent']);

			expect(filtered).toEqual({});
		});

		test('should handle empty object', () => {
			const object: Record<string, never> = {};
			const filtered: Pick<typeof object, never> = filterByKeyInclusion(object, ['anyKey']);

			expect(filtered).toEqual({});
		});
	});

	describe('when handling error cases', () => {
		test('should throw error when data is null', () => {
			const nullObject: Record<string, unknown> = _createNullObject();

			expect(() => filterByKeyInclusion(nullObject, [])).toThrow(expectedErrorMessages.NULL_DATA);
		});
	});
});

describe('filterByValue', () => {
	describe('when filtering with value predicate', () => {
		test('should return object with values matching predicate', () => {
			const object: Record<string, string> = { test: 'test', exclude: 'exclude' };
			const filtered: typeof object = filterByValue(object, (value: string): boolean => value === 'test');

			expect(filtered).toEqual({ test: 'test' });
			expect(filtered).not.toHaveProperty('exclude');
		});

		test('should handle complex predicates with various data types', () => {
			const object: Record<string, string | number | boolean> = {
				stringValue: 'test',
				numberValue: 42,
				booleanValue: true,
				anotherNumber: 100
			};
			const filtered: typeof object = filterByValue(
				object,
				(value: string | number | boolean): boolean => typeof value === 'number' && value > 50
			);

			expect(filtered).toEqual({ anotherNumber: 100 });
		});

		test('should work with array values', () => {
			const object: Record<string, unknown[]> = {
				shortArray: [1, 2],
				longArray: [1, 2, 3, 4, 5],
				emptyArray: []
			};
			const filtered: typeof object = filterByValue(
				object,
				(value: unknown[]): boolean => Array.isArray(value) && value.length > 2
			);

			expect(filtered).toEqual({ longArray: [1, 2, 3, 4, 5] });
		});
	});

	describe('when excluding null and undefined values', () => {
		test('should exclude null and undefined values when flag is true', () => {
			const object: Record<string, string | null | undefined> = testData.OBJECT_WITH_NULLS;
			const filtered: typeof object = filterByValue(
				object,
				(value: string | null | undefined): boolean => value === 'test',
				true
			);

			expect(filtered).toEqual({ test: 'test' });
		});

		test('should combine predicate filtering with null/undefined exclusion', () => {
			const object: Record<string, string | number | null | undefined> = {
				validString: 'keep',
				validNumber: 42,
				nullValue: null,
				undefinedValue: undefined,
				invalidString: 'reject'
			};
			const filteredData: typeof object = filterByValue(
				object,
				(value: string | number | null | undefined): boolean => (typeof value === 'string' && value === 'keep') || typeof value === 'number',
				true
			);

			expect(filteredData).toEqual({ validString: 'keep', validNumber: 42 });
		});
	});

	describe('when handling edge cases', () => {
		test('should return empty object when no values match predicate', () => {
			const object: Record<string, string> = { test: 'test', another: 'another' };
			const filtered: typeof object = filterByValue(object, (): boolean => false);

			expect(filtered).toEqual({});
		});

		test('should return all values when predicate always returns true', () => {
			const object: Record<string, string> = { test: 'test', another: 'another' };
			const filtered: typeof object = filterByValue(object, (): boolean => true);

			expect(filtered).toEqual(object);
		});

		test('should handle empty object', () => {
			const object: Record<string, never> = {};
			const filtered: typeof object = filterByValue(object, (): boolean => true);

			expect(filtered).toEqual({});
		});
	});

	describe('when handling error cases', () => {
		test('should throw error when data is null', () => {
			const nullObject: Record<string, unknown> = _createNullObject();

			expect(() => filterByValue(nullObject, (): boolean => true))
				.toThrow(expectedErrorMessages.NULL_DATA);
		});
	});
});

describe('transformKeys', () => {
	describe('when transforming keys with different transformers', () => {
		test('should transform keys to camelCase', () => {
			const object: Record<string, string> = { testKey: 'test', 'another-key': 'value' };
			const transformedData: typeof object = transformKeys(object, new CamelCaseTransformer());

			expect(transformedData).toEqual({ testKey: 'test', anotherKey: 'value' });
		});

		test('should transform keys to kebab-case', () => {
			const object: Record<string, string> = { testKey: 'test', AnotherKey: 'value' };
			const transformed: typeof object = transformKeys(object, new KebabCaseTransformer());

			expect(transformed).toEqual({ 'test-key': 'test', 'another-key': 'value' });
		});

		test('should transform keys to PascalCase', () => {
			const object: Record<string, string> = { testKey: 'test', 'another-key': 'value' };
			const transformedData: typeof object = transformKeys(object, new PascalCaseTransformer());

			expect(transformedData).toEqual({ TestKey: 'test', AnotherKey: 'value' });
		});

		test('should transform keys to snake_case', () => {
			const object: Record<string, string> = { testKey: 'test', 'another-key': 'value' };
			const transformedData: typeof object = transformKeys(object, new SnakeCaseTransformer());

			// eslint-disable-next-line camelcase
			expect(transformedData).toEqual({ test_key: 'test', another_key: 'value' });
		});

		test('should handle complex objects while preserving values', () => {
			const object: Record<string, unknown> = {
				simpleKey: 'string',
				'kebab-key': 42,
				PascalKey: true,
				nestedObject: { inner: 'value' },
				arrayValue: [1, 2, 3]
			};
			const transformedData: typeof object = transformKeys(object, new CamelCaseTransformer());

			expect(transformedData).toEqual({
				simpleKey: 'string',
				kebabKey: 42,
				pascalKey: true,
				nestedObject: { inner: 'value' },
				arrayValue: [1, 2, 3]
			});
		});
	});

	describe('when handling edge cases', () => {
		test('should handle empty object', () => {
			const object: Record<string, never> = {};
			const transformed: typeof object = transformKeys(object, new CamelCaseTransformer());

			expect(transformed).toEqual({});
		});

		test('should handle object with single key', () => {
			const object: Record<string, string> = { singleKey: 'value' };
			const transformedData: typeof object = transformKeys(object, new CamelCaseTransformer());

			expect(transformedData).toEqual({ singleKey: 'value' });
		});
	});

	describe('when handling error cases', () => {
		test('should throw error when data is null', () => {
			const nullObject: Record<string, unknown> = _createNullObject();

			expect(() => transformKeys(nullObject, new CamelCaseTransformer()))
				.toThrow(expectedErrorMessages.NULL_DATA);
		});
	});
});

describe('CamelCaseTransformer', () => {
	const transformer: CamelCaseTransformer = new CamelCaseTransformer();

	describe('when creating transformer instance', () => {
		test('should create a new instance', () => {
			const newTransformer: CamelCaseTransformer = new CamelCaseTransformer();
			expect(newTransformer).toBeInstanceOf(CamelCaseTransformer);
			expect(typeof newTransformer.convertCase).toBe('function');
		});

		test('should test constructor explicitly for function coverage', () => {
			const constructorTest: CamelCaseTransformer = new CamelCaseTransformer();
			expect(constructorTest).toBeDefined();
			expect(typeof constructorTest.convertCase).toBe('function');
		});
	});

	describe('when transforming various case formats', () => {
		test('should preserve already camelCase keys', () => {
			expect(transformer.convertCase(testData.CASE_VARIANTS.camelCase)).toBe('myKeyName');
		});

		test('should transform PascalCase to camelCase', () => {
			expect(transformer.convertCase(testData.CASE_VARIANTS.PascalCase)).toBe('myKeyName');
		});

		test('should transform kebab-case to camelCase', () => {
			expect(transformer.convertCase(testData.CASE_VARIANTS['kebab-case'])).toBe('myKeyName');
		});

		test('should transform snake_case to camelCase', () => {
			expect(transformer.convertCase(testData.CASE_VARIANTS.snakeCase)).toBe('myKeyName');
		});

		test('should handle mixed case formats', () => {
			expect(transformer.convertCase(testData.CASE_VARIANTS['mixed-Case_example']))
				.toBe('mixedCaseExample');
		});

		test('should handle multiple separators', () => {
			expect(transformer.convertCase('test_key-name')).toBe('testKeyName');
			expect(transformer.convertCase('another_test-value')).toBe('anotherTestValue');
		});
	});

	describe('when handling edge cases', () => {
		test('should handle single character keys', () => {
			expect(transformer.convertCase('a')).toBe('a');
			expect(transformer.convertCase('A')).toBe('a');
		});

		test('should handle empty string', () => {
			expect(transformer.convertCase('')).toBe('');
		});

		test('should handle keys with numbers', () => {
			expect(transformer.convertCase('key_with_123')).toBe('keyWith_123');
			expect(transformer.convertCase('key-with-456')).toBe('keyWith-456');
		});

		test('should handle consecutive uppercase letters', () => {
			expect(transformer.convertCase('XMLHttpRequest')).toBe('xMLHttpRequest');
			expect(transformer.convertCase('HTTPSProxy')).toBe('hTTPSProxy');
		});

		test('should handle specific regex edge cases', () => {
			// Test the first regex: /(?:[-_][a-z])/giu
			expect(transformer.convertCase('test-a')).toBe('testA');
			expect(transformer.convertCase('test_b')).toBe('testB');
			expect(transformer.convertCase('value-c_d')).toBe('valueCD');

			// Test the second regex: /^[A-Z]/u
			expect(transformer.convertCase('A')).toBe('a');
			expect(transformer.convertCase('Test')).toBe('test');
			expect(transformer.convertCase('TEST')).toBe('tEST');
		});
	});
});

describe('KebabCaseTransformer', () => {
	const transformer: KebabCaseTransformer = new KebabCaseTransformer();

	describe('when creating transformer instance', () => {
		test('should create a new instance', () => {
			const newTransformer: KebabCaseTransformer = new KebabCaseTransformer();
			expect(newTransformer).toBeInstanceOf(KebabCaseTransformer);
			expect(typeof newTransformer.convertCase).toBe('function');
		});

		test('should test constructor explicitly for function coverage', () => {
			const constructorTest: KebabCaseTransformer = new KebabCaseTransformer();
			expect(constructorTest).toBeDefined();
			expect(typeof constructorTest.convertCase).toBe('function');
		});
	});

	describe('when transforming various case formats', () => {
		test('should preserve already kebab-case keys', () => {
			expect(transformer.convertCase(testData.CASE_VARIANTS['kebab-case'])).toBe('my-key-name');
		});

		test('should transform camelCase to kebab-case', () => {
			expect(transformer.convertCase(testData.CASE_VARIANTS.camelCase)).toBe('my-key-name');
		});

		test('should transform PascalCase to kebab-case', () => {
			expect(transformer.convertCase(testData.CASE_VARIANTS.PascalCase)).toBe('my-key-name');
		});

		test('should transform snake_case to kebab-case', () => {
			expect(transformer.convertCase('my_long_key_name')).toBe('my-long-key-name');
		});

		test('should handle multiple underscores', () => {
			expect(transformer.convertCase('test_key_value')).toBe('test-key-value');
			expect(transformer.convertCase('another_test_case')).toBe('another-test-case');
		});
	});

	describe('when handling edge cases', () => {
		test('should handle single character keys', () => {
			expect(transformer.convertCase('a')).toBe('a');
			expect(transformer.convertCase('A')).toBe('a');
		});

		test('should handle empty string', () => {
			expect(transformer.convertCase('')).toBe('');
		});

		test('should handle consecutive capitals', () => {
			expect(transformer.convertCase('HTTPSConnection')).toBe('https-connection');
			expect(transformer.convertCase('XMLParser')).toBe('xml-parser');
		});

		test('should handle mixed separators', () => {
			expect(transformer.convertCase('test_Key-Name')).toBe('test-key-name');
			expect(transformer.convertCase('another_Value')).toBe('another-value');
		});
	});
});

describe('PascalCaseTransformer', () => {
	const transformer: PascalCaseTransformer = new PascalCaseTransformer();

	describe('when creating transformer instance', () => {
		test('should create a new instance', () => {
			const newTransformer: PascalCaseTransformer = new PascalCaseTransformer();
			expect(newTransformer).toBeInstanceOf(PascalCaseTransformer);
			expect(typeof newTransformer.convertCase).toBe('function');
		});

		test('should test constructor explicitly for function coverage', () => {
			const constructorTest: PascalCaseTransformer = new PascalCaseTransformer();
			expect(constructorTest).toBeDefined();
			expect(typeof constructorTest.convertCase).toBe('function');
		});
	});

	describe('when transforming various case formats', () => {
		test('should preserve already PascalCase keys', () => {
			expect(transformer.convertCase(testData.CASE_VARIANTS.PascalCase)).toBe('MyKeyName');
		});

		test('should transform camelCase to PascalCase', () => {
			expect(transformer.convertCase(testData.CASE_VARIANTS.camelCase)).toBe('MyKeyName');
		});

		test('should transform kebab-case to PascalCase', () => {
			expect(transformer.convertCase(testData.CASE_VARIANTS['kebab-case'])).toBe('MyKeyName');
		});

		test('should transform snake_case to PascalCase', () => {
			expect(transformer.convertCase(testData.CASE_VARIANTS.snakeCase)).toBe('MyKeyName');
		});

		test('should handle mixed separators', () => {
			expect(transformer.convertCase('test_key-name')).toBe('TestKeyName');
			expect(transformer.convertCase('another_test-value')).toBe('AnotherTestValue');
		});
	});

	describe('when handling edge cases', () => {
		test('should handle single character keys', () => {
			expect(transformer.convertCase('a')).toBe('A');
			expect(transformer.convertCase('A')).toBe('A');
		});

		test('should handle empty string', () => {
			expect(transformer.convertCase('')).toBe('');
		});

		test('should handle keys with numbers', () => {
			expect(transformer.convertCase('key_with_123')).toBe('KeyWith_123');
			expect(transformer.convertCase('another-key_456')).toBe('AnotherKey_456');
		});
	});
});

describe('SnakeCaseTransformer', () => {
	const transformer: SnakeCaseTransformer = new SnakeCaseTransformer();

	describe('when creating transformer instance', () => {
		test('should create a new instance', () => {
			const newTransformer: SnakeCaseTransformer = new SnakeCaseTransformer();
			expect(newTransformer).toBeInstanceOf(SnakeCaseTransformer);
			expect(typeof newTransformer.convertCase).toBe('function');
		});

		test('should test constructor explicitly for function coverage', () => {
			const constructorTest: SnakeCaseTransformer = new SnakeCaseTransformer();
			expect(constructorTest).toBeDefined();
			expect(typeof constructorTest.convertCase).toBe('function');
		});
	});

	describe('when transforming various case formats', () => {
		test('should preserve already snake_case keys', () => {
			expect(transformer.convertCase(testData.CASE_VARIANTS.snakeCase)).toBe('my_key_name');
		});

		test('should transform camelCase to snake_case', () => {
			expect(transformer.convertCase(testData.CASE_VARIANTS.camelCase)).toBe('my_key_name');
		});

		test('should transform PascalCase to snake_case', () => {
			expect(transformer.convertCase(testData.CASE_VARIANTS.PascalCase)).toBe('my_key_name');
		});

		test('should transform kebab-case to snake_case', () => {
			expect(transformer.convertCase('my-long-key-name')).toBe('my_long_key_name');
		});

		test('should handle spaces in keys', () => {
			expect(transformer.convertCase('test key name')).toBe('test_key_name');
			expect(transformer.convertCase('another test value')).toBe('another_test_value');
		});

		test('should handle mixed separators', () => {
			expect(transformer.convertCase('test-key name')).toBe('test_key_name');
			expect(transformer.convertCase('another value-test')).toBe('another_value_test');
		});
	});

	describe('when handling edge cases', () => {
		test('should handle single character keys', () => {
			expect(transformer.convertCase('a')).toBe('a');
			expect(transformer.convertCase('A')).toBe('a');
		});

		test('should handle empty string', () => {
			expect(transformer.convertCase('')).toBe('');
		});

		test('should handle consecutive capitals', () => {
			expect(transformer.convertCase('HTTPSConnection')).toBe('httpsconnection');
			expect(transformer.convertCase('XMLParser')).toBe('xmlparser');
		});

		test('should handle numbers in keys', () => {
			expect(transformer.convertCase('keyWith123')).toBe('key_with123');
			expect(transformer.convertCase('AnotherKey456')).toBe('another_key456');
		});

		test('should handle specific regex edge cases for 100% function coverage', () => {
			// Test the first regex: /(?<lower>[a-z])(?<upper>[A-Z])/gu
			expect(transformer.convertCase('aB')).toBe('a_b');
			expect(transformer.convertCase('testCase')).toBe('test_case');
			expect(transformer.convertCase('iPhone')).toBe('i_phone');

			// Test the second regex: /[-\s]/gu
			expect(transformer.convertCase('test-value')).toBe('test_value');
			expect(transformer.convertCase('test value')).toBe('test_value');
			expect(transformer.convertCase('test-key value')).toBe('test_key_value');

			// Test combinations to ensure all regex branches are hit
			expect(transformer.convertCase('testValue-name case')).toBe('test_value_name_case');
		});
	});
});

describe('Comprehensive Function Coverage Tests', () => {
	describe('CamelCase anonymous function coverage', () => {
		const transformer: CamelCaseTransformer = new CamelCaseTransformer();

		test('should trigger all anonymous functions in regex patterns', () => {
			// First regex: /(?:[-_][a-z])/giu - anonymous function (group: string) => (group[1]).toUpperCase()
			expect(transformer.convertCase('test-a')).toBe('testA');
			expect(transformer.convertCase('test_b')).toBe('testB');
			expect(transformer.convertCase('value-c_d')).toBe('valueCD');

			// Second regex: /^[A-Z]/u - anonymous function (firstLetter: string) => firstLetter.toLowerCase()
			expect(transformer.convertCase('A')).toBe('a');
			expect(transformer.convertCase('Test')).toBe('test');
			expect(transformer.convertCase('VALUE')).toBe('vALUE');

			// Combined patterns to ensure all branches
			expect(transformer.convertCase('Test-value_name')).toBe('testValueName');
		});
	});

	describe('KebabCase anonymous function coverage', () => {
		const transformer: KebabCaseTransformer = new KebabCaseTransformer();

		test('should trigger all regex patterns and anonymous functions', () => {
			// First regex: /_/gu - simple replacement, no anonymous function needed
			expect(transformer.convertCase('test_value')).toBe('test-value');

			// Second regex: /(?<=[a-z])(?=[A-Z])/gu - anonymous function for lookbehind/lookahead
			expect(transformer.convertCase('testValue')).toBe('test-value');
			expect(transformer.convertCase('aB')).toBe('a-b');

			// Third regex: /(?<=[A-Z]+)(?=[A-Z][a-z])/gu - complex pattern for consecutive capitals
			expect(transformer.convertCase('HTTPSConnection')).toBe('https-connection');
			expect(transformer.convertCase('XMLParser')).toBe('xml-parser');
			expect(transformer.convertCase('URLPattern')).toBe('url-pattern');

			// Combined patterns
			expect(transformer.convertCase('testHTTPSValue_name')).toBe('test-https-value-name');
		});
	});

	describe('PascalCase anonymous function coverage', () => {
		const transformer: PascalCaseTransformer = new PascalCaseTransformer();

		test('should trigger anonymous function in regex pattern', () => {
			// The regex: /(?:[-_][a-z])/giu with anonymous function (group: string) => (group[1]).toUpperCase()
			expect(transformer.convertCase('test-a')).toBe('TestA');
			expect(transformer.convertCase('value_b')).toBe('ValueB');
			expect(transformer.convertCase('name-c_d')).toBe('NameCD');
			expect(transformer.convertCase('example-value_test')).toBe('ExampleValueTest');

			// Edge cases to ensure the function is called
			expect(transformer.convertCase('-a')).toBe('A');
			expect(transformer.convertCase('_b')).toBe('B');
			expect(transformer.convertCase('test-x_y-z')).toBe('TestXYZ');
		});
	});

	describe('SnakeCase anonymous function coverage', () => {
		const transformer: SnakeCaseTransformer = new SnakeCaseTransformer();

		test('should trigger all named capture group replacements', () => {
			// First regex: /(?<lower>[a-z])(?<upper>[A-Z])/gu with replacement '$<lower>_$<upper>'
			expect(transformer.convertCase('aB')).toBe('a_b');
			expect(transformer.convertCase('testCase')).toBe('test_case');
			expect(transformer.convertCase('someValue')).toBe('some_value');
			expect(transformer.convertCase('iPhone')).toBe('i_phone');

			// Second regex: /[-\s]/gu - character class replacement
			expect(transformer.convertCase('test-case')).toBe('test_case');
			expect(transformer.convertCase('test case')).toBe('test_case');
			expect(transformer.convertCase('test-value case')).toBe('test_value_case');

			// Combined patterns to ensure full coverage
			expect(transformer.convertCase('testValue-name case')).toBe('test_value_name_case');
			expect(transformer.convertCase('iPhone-test case')).toBe('i_phone_test_case');
		});
	});
});
import type { CaseTransformer } from '#/modules/data/types/caseTransformer';
import type { KebabCase } from '#/modules/data/types/kebabCase';

/**
 * Transforms string into `kebab-case` format.
 * Implements ({@link CaseTransformer}).
 */
export class KebabCaseTransformer implements CaseTransformer {
	/**
     * Transforms a single string from any case to `kebab-case`.
     *
     * @template S - The string type to be transformed.
     *
     * @param str - The string to transform into `kebab-case`.
     *
     * @returns The string transformed into `kebab-case`, with all letters in lower case and words separated by hyphens.
     *
     * @example
     * convertCase('myKeyName'); // "my-key-name"
     * @example
     * convertCase('MyKeyName'); // "my-key-name"
     * @example
     * convertCase('my_long_key_name'); // "my-long-key-name"
     */
	public convertCase<S extends string>(str: S): KebabCase<S> {
		return str
			.replace(/_/gu, '-')
			.replace(/(?<=[a-z])(?=[A-Z])/gu, '-')
			.replace(/(?<=[A-Z]+)(?=[A-Z][a-z])/gu, '-')
			.toLowerCase() as KebabCase<S>;
	}
}

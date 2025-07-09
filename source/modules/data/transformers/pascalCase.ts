import type { CaseTransformer } from '#/modules/data/types/caseTransformer';
import type { PascalCase } from '#/modules/data/types/pascalCase';

/**
 * Transforms string into `PascalCase` format.
 * Implements ({@link CaseTransformer}).
 */
export class PascalCaseTransformer implements CaseTransformer {
	/**
	 * Transforms a single string from any case to `PascalCase`.
	 *
	 * @template S - The string type to be transformed.
	 *
	 * @param str - The string to transform into `PascalCase`.
	 *
	 * @returns The string transformed into `PascalCase`, with the first letter of each word capitalized.
	 *
	 * @example
	 * convertCase('my_key_name'); // "MyKeyName"
	 * @example
	 * convertCase('my-key-name'); // "MyKeyName"
	 * @example
	 * convertCase('myLongKeyName'); // "MyKeyName"
	 */
	public convertCase<S extends string>(str: S): PascalCase<S> {
		const camelCaseKey: string = str.replace(/(?:[-_][a-z])/giu, (group: string) => (group[1]).toUpperCase());
		return camelCaseKey.charAt(0).toUpperCase() + camelCaseKey.slice(1) as PascalCase<S>;
	}
}

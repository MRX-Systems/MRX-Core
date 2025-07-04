import type { CamelCase } from '#/modules/data/types/camelCase';
import type { CaseTransformer } from '#/modules/data/types/caseTransformer';

/**
 * Transforms string into `camelCase` format.
 * Implements ({@link CaseTransformer}).
 */
export class CamelCaseTransformer implements CaseTransformer {
	/**
     * Transforms a string from any case to `camelCase`.
     *
     * @template S - The string type to be transformed.
     *
     * @param str - The string to transform into `camelCase`. {@link S}
     *
     * @returns The string transformed into `camelCase`.
     *
     * @example
     * convertCase('MyKeyName'); // "myKeyName"
     * @example
     * convertCase('my-key-name'); // "myKeyName"
     * @example
     * convertCase('my_key_name'); // "myKeyName"
     */
	public convertCase<S extends string>(str: S): CamelCase<S> {
		return str
			.replace(/(?:[-_][a-z])/giu, (group: string) => (group[1]).toUpperCase())
			.replace(/^[A-Z]/u, (firstLetter: string) => firstLetter.toLowerCase()) as CamelCase<S>;
	}
}

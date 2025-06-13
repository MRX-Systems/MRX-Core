import type { CamelCase } from '#/modules/data/types/camelCase';
import type { CaseTransformer } from '#/modules/data/types/caseTransformer';

/**
 * Transforms string into camelCase format.
 * Implements ({@link CaseTransformer}).
 */
export class CamelCaseTransformer implements CaseTransformer {
    /**
     * Transforms a string from any case to camelCase.
     *
     * @template S - The string type to be transformed.
     *
     * @param str - The string to transform into camelCase.
     *
     * @returns The string transformed into camelCase.
     *
     * @example
     * transformKey('MyKeyName');
     * Returns "myKeyName"
     * @example
     * transformKey('my-key-name');
     * Returns "myKeyName"
     * @example
     * transformKey('my_key_name');
     * Returns "myKeyName"
     */
    public convertCase<S extends string>(str: S): CamelCase<S> {
        return str
            .replace(/(?:[-_][a-z])/giu, (group: string) => (group[1]).toUpperCase())
            .replace(/^[A-Z]/u, (firstLetter: string) => firstLetter.toLowerCase()) as CamelCase<S>;
    }
}

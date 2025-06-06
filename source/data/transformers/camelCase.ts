import type { CaseTransformer } from '#/data/types/keyTransformer';

/**
 * Transforms string into camelCase format.
 * Implements ({@link CaseTransformer}).
 */
export class CamelCaseTransformer implements CaseTransformer {
    /**
     * Transforms a string from any case to camelCase.
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
    public convertCase(str: string): string {
        return str
            .replace(/(?:[-_][a-z])/giu, (group: string) => (group[1]).toUpperCase())
            .replace(/^[A-Z]/u, (firstLetter: string) => firstLetter.toLowerCase());
    }
}

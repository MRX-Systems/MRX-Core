import type { CaseTransformer } from '#/data/types/keyTransformer';

/**
 * Transforms string into PascalCase format.
 * Implements ({@link CaseTransformer}).
 */
export class PascalCaseTransformer implements CaseTransformer {
    /**
     * Transforms a single string from any case to PascalCase.
     *
     * @param str - The string to transform into PascalCase.
     *
     * @returns The string transformed into PascalCase, with the first letter of each word capitalized.
     *
     * @example
     * transformKey('my_key_name');
     * Returns "MyKeyName"
     * @example
     * transformKey('my-key-name');
     * Returns "MyKeyName"
     * @example
     * transformKey('myLongKeyName');
     * Returns "MyLongKeyName"
     */
    public convertCase(str: string): string {
        const camelCaseKey: string = str.replace(/(?:[-_][a-z])/giu, (group: string) => (group[1]).toUpperCase());
        return camelCaseKey.charAt(0).toUpperCase() + camelCaseKey.slice(1);
    }
}

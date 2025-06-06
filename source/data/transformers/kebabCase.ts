import type { CaseTransformer } from '#/data/types/keyTransformer';

/**
 * Transforms string into kebab-case format.
 * Implements ({@link CaseTransformer}).
 */
export class KebabCaseTransformer implements CaseTransformer {
    /**
     * Transforms a single string from any case to kebab-case.
     *
     * @param str - The string to transform into kebab-case.
     *
     * @returns The string transformed into kebab-case, with all letters in lower case and words separated by hyphens.
     *
     * @example
     * transformKey('myKeyName');
     * Returns "my-key-name"
     * @example
     * transformKey('MyKeyName');
     * Returns "my-key-name"
     * @example
     * transformKey('my_long_key_name');
     * Returns "my-long-key-name"
     */
    public convertCase(str: string): string {
        return str
            .replace(/_/gu, '-')
            .replace(/(?<=[a-z])(?=[A-Z])/gu, '-')
            .replace(/(?<=[A-Z]+)(?=[A-Z][a-z])/gu, '-')
            .toLowerCase();
    }
}

import type { KeyTransformer } from '#/data/types/keyTransformer';

/**
 * Transforms string keys into kebab-case format.
 * Implements ({@link KeyTransformer}).
 */
export class KebabCaseTransformer implements KeyTransformer {
    /**
     * Transforms a single key from any case to kebab-case.
     *
     * @param key - The key string to transform into kebab-case.
     *
     * @returns The key string transformed into kebab-case, with all letters in lower case and words separated by hyphens.
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
    public transformKey(key: string): string {
        return key
            .replace(/_/gu, '-')
            .replace(/(?<=[a-z])(?=[A-Z])/gu, '-')
            .replace(/(?<=[A-Z]+)(?=[A-Z][a-z])/gu, '-')
            .toLowerCase();
    }
}

import type { KeyTransformer } from '#/modules/data/types/keyTransformer';

/**
 * Transforms string keys into camelCase format.
 * Implements ({@link KeyTransformer}).
 */
export class CamelCaseTransformer implements KeyTransformer {
    /**
     * Transforms a single key from any case to camelCase.
     *
     * @param key - The key string to transform into camelCase.
     *
     * @returns The key string transformed into camelCase.
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
    public transformKey(key: string): string {
        return key
            .replace(/(?:[-_][a-z])/giu, (group: string) => (group[1]).toUpperCase())
            .replace(/^[A-Z]/u, (firstLetter: string) => firstLetter.toLowerCase());
    }
}

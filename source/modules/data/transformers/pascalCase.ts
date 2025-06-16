import type { KeyTransformer } from '#/modules/data/types/keyTransformer';

/**
 * Transforms string keys into PascalCase format.
 * Implements ({@link KeyTransformer}).
 */
export class PascalCaseTransformer implements KeyTransformer {
    /**
     * Transforms a single key from any case to PascalCase.
     *
     * @param key - The key string to transform into PascalCase.
     *
     * @returns The key string transformed into PascalCase, with the first letter of each word capitalized.
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
    public transformKey(key: string): string {
        const camelCaseKey: string = key.replace(/(?:[-_][a-z])/giu, (group: string) => (group[1]).toUpperCase());
        return camelCaseKey.charAt(0).toUpperCase() + camelCaseKey.slice(1);
    }
}

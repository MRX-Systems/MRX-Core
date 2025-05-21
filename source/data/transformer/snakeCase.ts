import type { KeyTransformer } from '#/data/types/keyTransformer';

/**
 * Transforms string keys into snake_case format.
 * Implements ({@link KeyTransformer}).
 */
export class SnakeCaseTransformer implements KeyTransformer {
    /**
     * Transforms a single key from any case to snake_case.
     *
     * @param key - The key string to transform into snake_case.
     *
     * @returns The key string transformed into snake_case, with underscores between words.
     *
     * @example
     * transformKey('myKeyName');
     * Returns "my_key_name"
     * @example
     * transformKey('MyKeyName');
     * Returns "my_key_name"
     * @example
     * transformKey('My-Key-Name');
     * Returns "my_key_name"
     */
    public transformKey(key: string): string {
        return key
            .replace(/(?<lower>[a-z])(?<upper>[A-Z])/gu, '$<lower>_$<upper>')
            .replace(/[-\s]/gu, '_')
            .toLowerCase();
    }
}

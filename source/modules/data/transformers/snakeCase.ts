import type { CaseTransformer } from '#/modules/data/types/caseTransformer';
import type { SnakeCase } from '#/modules/data/types/snakeCase';

/**
 * Transforms string into snake_case format.
 * Implements ({@link CaseTransformer}).
 */
export class SnakeCaseTransformer implements CaseTransformer {
    /**
     * Transforms a single string from any case to snake_case.
     *
     * @template S - The string type to be transformed.
     *
     * @param str - The string to transform into snake_case.
     *
     * @returns The string transformed into snake_case, with underscores between words.
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
    public convertCase<S extends string>(str: S): SnakeCase<S> {
        return str
            .replace(/(?<lower>[a-z])(?<upper>[A-Z])/gu, '$<lower>_$<upper>')
            .replace(/[-\s]/gu, '_')
            .toLowerCase() as SnakeCase<S>;
    }
}

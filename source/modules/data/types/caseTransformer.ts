export interface CaseTransformer<TTransform extends string = string> {
    /**
     * Transforms a single string from any case to another case.
     *
     * @template TTransform - The type of the transformed string.
     * @template S - The type of the input string.
     *
     * @param str - The string to transform.
     *
     * @returns The string transformed into the desired case.
     */
    convertCase<S extends string>(str: S): TTransform;
}

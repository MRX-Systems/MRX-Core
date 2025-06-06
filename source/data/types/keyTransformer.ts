export interface CaseTransformer {
    /**
     * Transforms a single string from any case to another case.
     * @param str - The string to transform.
     * @returns The string transformed into the desired case.
     */
    convertCase(str: string): string;
}

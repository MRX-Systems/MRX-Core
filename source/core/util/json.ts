/**
 * Check if a string is a valid JSON
 *
 * @param value - The string to check if it's a valid JSON
 *
 * @returns Whether the string is a valid JSON
 */
export function isJson(value: string): boolean {
    try {
        JSON.parse(value);
        return true;
    } catch {
        return false;
    }
}
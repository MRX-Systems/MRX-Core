/**
 * Check if the given string is a JSON string.
 *
 * @param str - The string to check if it is a JSON string.
 *
 * @returns True if the given string is a JSON string, false otherwise.
 */
export function isJsonString(str: string): boolean {
    try {
        JSON.parse(str);
    } catch {
        return false;
    }
    return true;
}

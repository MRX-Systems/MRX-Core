/**
 * Checks if a value is a valid date string.
 *
 * @param v - The value to check.
 *
 * @returns True if the value is a valid date string, false otherwise.
 *
 * @example
 * ```typescript
 * isDateString('2023-10-01T12:00:00Z'); // true
 * isDateString('invalid-date'); // false
 * isDateString(12345); // false
 * isDateString(new Date().toISOString()); // true
 * ```
 */
export const isDateString = (v: unknown): v is string => typeof v === 'string' && new Date(v).toString() !== 'Invalid Date';
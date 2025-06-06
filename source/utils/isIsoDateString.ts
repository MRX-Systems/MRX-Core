/**
 * Checks if a value is a valid ISO date string.
 *
 * @param v - The value to check.
 *
 * @returns True if the value is a valid ISO date string, false otherwise.
 *
 * @example
 * ```typescript
 * isIsoDateString('2023-10-01T12:00:00Z'); // true
 * isIsoDateString('invalid-date'); // false
 * isIsoDateString(12345); // false
 * isIsoDateString(new Date().toISOString()); // true
 * ```
 */
export const isIsoDateString = (v: unknown): v is string => typeof v === 'string' && new Date(v).toString() !== 'Invalid Date';
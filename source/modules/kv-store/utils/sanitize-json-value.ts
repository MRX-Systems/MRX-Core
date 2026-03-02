/**
 * Sanitizes a parsed JSON value to prevent prototype pollution attacks.
 *
 * @param value - The parsed value to sanitize.
 *
 * @returns The sanitized value.
 */
export const sanitizeJsonValue = <T>(value: T): T => {
	if (value !== null && typeof value === 'object') {
		Object.setPrototypeOf(value, null);
		Reflect.deleteProperty(value as object, 'constructor');
		Reflect.deleteProperty(value as object, 'prototype');
	}
	return value;
};

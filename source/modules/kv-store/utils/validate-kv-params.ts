import { InternalError } from '#/errors/internal-error';
import { KV_STORE_ERROR_KEYS } from '#/modules/kv-store/enums/kv-store-error-keys';

/**
 * Validates that a key is a non-empty string with reasonable length.
 *
 * @param key - The key to validate.
 *
 * @throws ({@link InternalError}) – If the key is invalid.
 */
export const validateKey = (key: string): void => {
	if (!key || typeof key !== 'string' || key.length > 1024 || key.includes('\0'))
		throw new InternalError(KV_STORE_ERROR_KEYS.INVALID_KEY);
};

/**
 * Validates that a TTL value is a positive finite integer.
 *
 * @param ttlSec - The TTL value to validate.
 *
 * @throws ({@link InternalError}) – If the TTL is invalid.
 */
export const validateTtl = (ttlSec: number | undefined): void => {
	if (ttlSec === undefined) return;

	if (!Number.isFinite(ttlSec) || ttlSec <= 0 || !Number.isInteger(ttlSec))
		throw new InternalError(KV_STORE_ERROR_KEYS.INVALID_TTL);
};

/**
 * Validates that an increment/decrement amount is a finite integer.
 *
 * @param amount - The amount to validate.
 *
 * @throws ({@link InternalError}) – If the amount is invalid.
 */
export const validateAmount = (amount: number): void => {
	if (!Number.isFinite(amount) || !Number.isInteger(amount))
		throw new InternalError(KV_STORE_ERROR_KEYS.INVALID_AMOUNT);
};

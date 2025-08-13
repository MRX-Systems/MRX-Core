import { webcrypto } from 'crypto';

/**
 * Generate HMAC for given data using a crypto key
 *
 * @param key - Crypto key for HMAC
 * @param data - Data to sign
 *
 * @returns Promise resolving to HMAC as Uint8Array
 */
export const generateHmac = async (
	key: CryptoKey,
	data: ArrayBuffer
): Promise<Uint8Array> => {
	const hmac = await webcrypto.subtle.sign('HMAC', key, data);
	return new Uint8Array(hmac);
};

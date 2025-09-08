import { webcrypto } from 'crypto';

import type { TotpOptions } from './types/totp-options';
import { createCounterBuffer } from './utils/create-counter-buffer';
import { dynamicTruncation } from './utils/dynamic-truncation';
import { generateHmac } from './utils/generate-hmac';

/**
 * HMAC-based One-Time Password (HOTP) implementation
 *
 * @param secret - Secret key as bytes
 * @param counter - Counter value
 * @param opts - HOTP options
 *
 * @returns Promise resolving to the HOTP code
 */
export const hotp = async (
	secret: Uint8Array,
	counter: number | bigint,
	{
		algorithm = 'SHA-1',
		digits = 6
	}: TotpOptions = {}
): Promise<string> => {
	const counterBuffer = createCounterBuffer(counter);
	const key = await webcrypto.subtle.importKey(
		'raw',
		secret,
		{ name: 'HMAC', hash: algorithm },
		false,
		['sign']
	);
	const hmacArray = await generateHmac(key, counterBuffer);
	return dynamicTruncation(hmacArray, digits);
};
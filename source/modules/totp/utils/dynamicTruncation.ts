/**
 * Perform dynamic truncation on HMAC result according to RFC 4226
 *
 * @param hmacArray - HMAC result as byte array
 * @param digits - Number of digits in the final code
 *
 * @returns Truncated code as string with leading zeros
 */
export const dynamicTruncation = (
	hmacArray: Uint8Array,
	digits: number
): string => {
	const offset = hmacArray[hmacArray.length - 1] & 0x0f;
	const code = (
		((hmacArray[offset] & 0x7f) << 24)
		| ((hmacArray[offset + 1] & 0xff) << 16)
		| ((hmacArray[offset + 2] & 0xff) << 8)
		| (hmacArray[offset + 3] & 0xff)
	) % (10 ** digits);
	return code.toString().padStart(digits, '0');
};

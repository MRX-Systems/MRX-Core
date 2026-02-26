/**
 * Convert a counter value to an 8-byte big-endian buffer
 *
 * @remarks
 * Always uses BigInt internally to support full 64-bit counter values.
 * This fixes potential integer overflow issues when counter exceeds 2^32-1.
 *
 * For TOTP, time steps are calculated as Math.floor(Date.now() / 1000 / period).
 * Current time steps are ~57 million, well within 32-bit range, but this
 * ensures correctness for far-future dates and high-precision use cases.
 *
 * @param counter - Counter value as number or bigint
 *
 * @returns ArrayBuffer containing the counter in big-endian format (8 bytes)
 */
export const createCounterBuffer = (counter: number | bigint): ArrayBuffer => {
	const counterBuffer = new ArrayBuffer(8);
	const counterView = new DataView(counterBuffer);

	// Security: Always use BigInt for full 64-bit support
	// This prevents silent truncation for counters > 2^32-1
	const counterBigInt = typeof counter === 'bigint' ? counter : BigInt(Math.trunc(counter));

	counterView.setBigUint64(0, counterBigInt, false);

	return counterBuffer;
};

/**
 * Convert a counter value to an 8-byte big-endian buffer
 *
 * @param counter - Counter value as number or bigint
 *
 * @returns ArrayBuffer containing the counter in big-endian format
 */
export const createCounterBuffer = (counter: number | bigint): ArrayBuffer => {
	const counterBuffer = new ArrayBuffer(8);
	const counterView = new DataView(counterBuffer);

	if (typeof counter === 'bigint')
		counterView.setBigUint64(0, counter, false);
	else
		counterView.setUint32(4, counter, false);

	return counterBuffer;
};

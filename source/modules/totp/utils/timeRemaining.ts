/**
 * Calculate remaining time until next TOTP code
 *
 * @param period - Time period in seconds (default: 30)
 * @param now - Current timestamp in milliseconds (default: Date.now())
 *
 * @returns Seconds remaining until next code
 */
export const timeRemaining = (period = 30, now = Date.now()): number => {
	const elapsed = Math.floor(now / 1000) % period;
	return period - elapsed;
};

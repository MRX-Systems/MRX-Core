/**
 * Options for TOTP/HOTP generation
 */
export interface TotpOptions {
	/**
	 * Hash algorithm to use
	 *
	 * @defaultValue SHA-1
	 */
	algorithm?: 'SHA-1' | 'SHA-256' | 'SHA-512';
	/**
	 * Number of digits in the code
	 *
	 * @defaultValue 6
	 */
	digits?: 6 | 8;
	/**
	 * Time step in seconds for TOTP
	 *
	 * @defaultValue 30
	 */
	period?: number;
}

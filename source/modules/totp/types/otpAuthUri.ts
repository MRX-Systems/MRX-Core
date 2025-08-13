/**
 * Complete OTPAuth URI data structure
 */
export interface OtpAuthUri {
	/**
	 * Base32 encoded secret
	 */
	secretBase32: string;
	/**
	 * Label for the account (usually email or username)
	 */
	label: string;
	/**
	 * Issuer name (app/service name)
	 */
	issuer: string;
	/**
	 * Hash algorithm
	 *
	 * @defaultValue 'SHA-1'
	 */
	algorithm?: 'SHA-1' | 'SHA-256' | 'SHA-512';
	/**
	 * Number of digits
	 *
	 * @defaultValue 6
	 */
	digits?: 6 | 8;
	/**
	 * Time period in seconds
	 *
	 * @defaultValue 30
	 */
	period?: number;
}
/**
 * Parsed OTPAuth URI result
 */
export interface ParsedOtpAuthUri {
	/**
	 * Base32 encoded secret
	 */
	secretBase32: string;
	/**
	 * Issuer name
	 */
	issuer?: string;
	/**
	 * Account label
	 */
	label: string;
	/**
	 * Hash algorithm
	 */
	algorithm: string;
	/**
	 * Number of digits
	 */
	digits: number;
	/**
	 * Time period in seconds
	 */
	period: number;
}

export interface SMTPCredentials {
	/**
     * The username for SMTP authentication.
     */
	readonly user: string;

	/**
     * The password for SMTP authentication.
     */
	readonly pass: string;
}
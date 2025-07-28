import { createTransport, type SendMailOptions, type Transporter } from 'nodemailer';

import { BaseError } from '#/errors/baseError';
import { MAILER_ERROR_KEYS } from './enums/mailerErrorKeys';
import type { SMTPOptions } from './types/smtpOptions';

/**
 * The `SMTP` class manages the connection and operations with an SMTP server.
 *
 * This class provides methods to connect, disconnect, and send emails using
 * the Nodemailer library. It supports connection pooling and error handling ({@link BaseError}).
 *
 * @example
 * ```ts
 * const smtp = new SMTP({
 *   host: 'smtp.example.com',
 *   credentials: { user: 'user', pass: 'pass' }
 * });
 * await smtp.connect();
 * await smtp.sendMail({ to: 'dest@example.com', subject: 'Hello', text: 'Hi!' });
 * smtp.disconnect();
 * ```
 */
export class SMTP {
	/**
	 * The configuration options for the SMTP connection.
	 */
	private readonly _config: SMTPOptions;

	/**
	 * The Nodemailer transporter instance for sending emails.
	 */
	private _transporter: Transporter | null = null;

	/**
	 * Creates an instance of the SMTP class.
	 *
	 * @param config - The configuration options for the SMTP connection.
	 */
	public constructor(config: SMTPOptions) {
		this._config = {
			port: 587,
			secure: false,
			...config
		};
	}

	/**
	 * Establishes a pool of connections to the SMTP server and verifies the connection.
	 *
	 * This method creates a Nodemailer transporter using the configuration provided to the class.
	 * It enables connection pooling for efficient resource usage and sets the maximum number of
	 * concurrent connections as specified in the configuration (default: 5).
	 *
	 * @throws ({@link BaseError}): If the transporter is already connected.
	 * @throws ({@link BaseError}): If the connection or verification fails.
	 */
	public async connect(): Promise<void> {
		if (this._transporter)
			throw new BaseError({ message: MAILER_ERROR_KEYS.SMTP_ALREADY_CONNECTED });

		this._transporter = createTransport({
			host: this._config.host,
			port: this._config.port,
			secure: this._config.secure,
			auth: {
				user: this._config.credentials.user,
				pass: this._config.credentials.pass
			},
			pool: true,
			maxConnections: this._config.pool?.maxConnections ?? 5
		});
		try {
			await this._transporter.verify();
		} catch (error) {
			throw new BaseError({
				message: MAILER_ERROR_KEYS.SMTP_CONNECTION_ERROR,
				cause: error
			});
		}
	}

	/**
	 * Closes the SMTP connection and releases resources.
	 *
	 * If the transporter is not connected, this method does nothing.
	 */
	public disconnect(): void {
		if (this._transporter) {
			this._transporter.close();
			this._transporter = null;
		}
	}

	/**
	 * Sends an email using the established SMTP connection.
	 *
	 * @param options - The mail options, such as recipient, subject, and content.
	 *
	 * @throws ({@link BaseError}) - If the transporter is not connected.
	 *
	 * @returns A promise resolving to the result of the send operation.
	 */
	public async sendMail(options: SendMailOptions): Promise<unknown> {
		if (!this._transporter)
			throw new BaseError({ message: MAILER_ERROR_KEYS.SMTP_NOT_CONNECTED });
		return this._transporter.sendMail(options);
	}
}
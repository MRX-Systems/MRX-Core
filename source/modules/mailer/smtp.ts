import { createTransport, type SendMailOptions, type Transporter } from 'nodemailer';

import { CoreError } from '#/error/coreError';
import { mailerErrorKeys } from './enums/mailerErrorKeys';
import type { SMTPOptions } from './types/smtpOptions';

/**
 * The `SMTP` class manages the connection and operations with an SMTP server.
 *
 * This class provides methods to connect, disconnect, and send emails using
 * the Nodemailer library. It supports connection pooling and error handling ({@link CoreError}).
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
     * @param config - The configuration options for the SMTP connection. (see {@link SMTPOptions}).
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
     * @throws ({@link CoreError}): If the transporter is already connected. ({@link mailerErrorKeys.smtpAlreadyConnected})
     * @throws ({@link CoreError}): If the connection or verification fails. ({@link mailerErrorKeys.smtpConnectionError})
     */
    public async connect(): Promise<void> {
        // If already connected, throw an error.
        if (this._transporter)
            throw new CoreError({
                key: mailerErrorKeys.smtpAlreadyConnected,
                message: 'SMTP transporter is already connected.'
            });

        // Create a Nodemailer transporter with pooling and authentication.
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
            // Attempt to verify the SMTP connection.
            await this._transporter.verify();
        } catch (error) {
            // Wrap and throw connection errors as CoreError for consistent error handling.
            throw new CoreError({
                key: mailerErrorKeys.smtpConnectionError,
                message: 'An error occurred while connecting to the SMTP server',
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
     * @throws ({@link CoreError}) - If the transporter is not connected. ({@link mailerErrorKeys.smtpNotConnected})
     *
     * @returns A promise resolving to the result of the send operation.
     */
    public async sendMail(options: SendMailOptions): Promise<unknown> {
        if (!this._transporter)
            throw new CoreError({
                key: mailerErrorKeys.smtpNotConnected,
                message: 'SMTP transporter is not connected.'
            });
        return this._transporter.sendMail(options);
    }
}
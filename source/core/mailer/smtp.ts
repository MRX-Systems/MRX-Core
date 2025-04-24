import { createTransport, type Transporter } from 'nodemailer';
import type { Options } from 'nodemailer/lib/mailer';

import { CoreError } from '#/error/coreError';
import { MAILER_KEY_ERROR } from '#/error/key/mailerKeyError';

/**
 * Credentials required for SMTP authentication.
 *
 * This interface defines the username and password needed to authenticate
 * with an SMTP server.
 *
 * @example
 * ```typescript
 * const credentials: SMTPCredentials = {
 *   user: 'myuser',
 *   pass: 'mypassword'
 * };
 * ```
 */
export interface SMTPCredentials {
    /**
     * The username for SMTP authentication.
     */
    user: string;

    /**
     * The password for SMTP authentication.
     */
    pass: string;
}

/**
 * Options for configuring the SMTP connection pool.
 *
 * This interface allows you to specify the maximum number of concurrent
 * connections to the SMTP server.
 *
 * @example
 * ```typescript
 * const poolOptions: SMTPPoolOptions = {
 *   maxConnections: 10
 * };
 * ```
 */
export interface SMTPPoolOptions {
    /**
     * The maximum number of concurrent SMTP connections.
     * @defaultValue 5
     */
    maxConnections?: number;
}

/**
 * Configuration options for the SMTP client.
 *
 * This interface defines all necessary parameters to establish a connection
 * to an SMTP server, including host, port, security, credentials, and pool options.
 *
 * @example
 * ```typescript
 * const config: SMTPConfig = {
 *   host: 'smtp.example.com',
 *   port: 587,
 *   secure: false,
 *   credentials: {
 *     user: 'user@example.com',
 *     pass: 'password'
 *   },
 *   pool: { maxConnections: 5 }
 * };
 * ```
 */
export interface SMTPConfig {
    /**
     * The hostname or IP address of the SMTP server.
     */
    host: string;

    /**
     * The port number to connect to.
     * @defaultValue 587
     */
    port?: number;

    /**
     * Whether to use a secure (TLS) connection.
     * @defaultValue false
     */
    secure?: boolean;

    /**
     * The credentials for SMTP authentication.
     */
    credentials: SMTPCredentials;

    /**
     * Optional pool configuration.
     */
    pool?: SMTPPoolOptions;
}

/**
 * Options for sending an email.
 */
export type SendMailOptions = Options;

/**
 * The `SMTP` class manages the connection and operations with an SMTP server.
 *
 * This class provides methods to connect, disconnect, and send emails using
 * the Nodemailer library. It supports connection pooling and error handling
 * via custom error classes.
 *
 * ### Key Features:
 * - Establish and verify SMTP connections.
 * - Support for connection pooling.
 * - Send emails with custom options.
 * - Graceful disconnect and resource cleanup.
 * - Typed error handling with custom error keys.
 *
 * @example
 * ```typescript
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
     * The configuration for the SMTP connection.
     */
    private readonly _config: SMTPConfig;

    /**
     * The Nodemailer transporter instance.
     */
    private _transporter: Transporter | null = null;

    /**
     * Creates a new instance of the `SMTP` class with the specified configuration.
     *
     * @param config - The SMTP configuration options.
     */
    public constructor(config: SMTPConfig) {
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
     * After creating the transporter, it attempts to verify the connection to the SMTP server.
     * If verification fails, a {@link CoreError} is thrown with the error key
     * {@link MAILER_KEY_ERROR.SMTP_CONNECTION_ERROR}, including the original error as the cause.
     *
     * @throws ({@link CoreError}): If the transporter is already connected. ({@link MAILER_KEY_ERROR.SMTP_ALREADY_CONNECTED})
     * @throws ({@link CoreError}): If the connection or verification fails. ({@link MAILER_KEY_ERROR.SMTP_CONNECTION_ERROR})
     */
    public async connect(): Promise<void> {
        // If already connected, throw an error.
        if (this._transporter)
            throw new CoreError({
                key: MAILER_KEY_ERROR.SMTP_ALREADY_CONNECTED,
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
                key: MAILER_KEY_ERROR.SMTP_CONNECTION_ERROR,
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
     * @returns A promise resolving to the result of the send operation.
     *
     * @throws ({@link CoreError}) - If the transporter is not connected. ({@link MAILER_KEY_ERROR.SMTP_NOT_CONNECTED})
     */
    public async sendMail(options: SendMailOptions): Promise<unknown> {
        if (!this._transporter)
            throw new CoreError({
                key: MAILER_KEY_ERROR.SMTP_NOT_CONNECTED,
                message: 'SMTP transporter is not connected.'
            });
        return this._transporter.sendMail(options);
    }
}
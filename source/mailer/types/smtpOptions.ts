import type { SMTPCredentials } from './smtpCredentials';
import type { SMTPPoolOptions } from './smtpPoolOptions';

export interface SMTPOptions {
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
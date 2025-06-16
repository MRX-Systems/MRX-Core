import type { SMTPCredentials } from './smtpCredentials';
import type { SMTPPoolOptions } from './smtpPoolOptions';

export interface SMTPOptions {
    /**
     * The hostname or IP address of the SMTP server.
     */
    readonly host: string;

    /**
     * The port number to connect to.
     * @defaultValue 587
     */
    readonly port?: number;

    /**
     * Whether to use a secure (TLS) connection.
     * @defaultValue false
     */
    readonly secure?: boolean;

    /**
     * The credentials for SMTP authentication.
     */
    readonly credentials: SMTPCredentials;

    /**
     * Optional pool configuration.
     */
    readonly pool?: SMTPPoolOptions;
}
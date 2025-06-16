export interface SMTPPoolOptions {
    /**
     * The maximum number of concurrent SMTP connections.
     * @defaultValue 5
     */
    maxConnections?: number;
}
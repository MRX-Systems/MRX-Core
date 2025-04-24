import { createTransport, type Transporter } from 'nodemailer';
import type { Readable } from 'stream';

import { CoreError } from '#/error/coreError';
import { MAILER_KEY_ERROR } from '#/error/key/mailerKeyError';
import type { Url } from 'url';

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

export interface Address {
    name: string;
    address: string;
}

export interface AttachmentLike {
    /** String, Buffer or a Stream contents for the attachment */
    content?: string | Buffer | Readable | undefined;
    /** path to a file or an URL (data uris are allowed as well) if you want to stream the file instead of including it (better for larger attachments) */
    path?: string | Url | undefined;
}

interface Attachment extends AttachmentLike {
    /** filename to be reported as the name of the attached file, use of unicode is allowed. If you do not want to use a filename, set this value as false, otherwise a filename is generated automatically */
    filename?: string | false | undefined;
    /** optional content id for using inline images in HTML message source. Using cid sets the default contentDisposition to 'inline' and moves the attachment into a multipart/related mime node, so use it only if you actually want to use this attachment as an embedded image */
    cid?: string | undefined;
    /** If set and content is string, then encodes the content to a Buffer using the specified encoding. Example values: base64, hex, binary etc. Useful if you want to use binary attachments in a JSON formatted e-mail object */
    encoding?: string | undefined;
    /** optional content type for the attachment, if not set will be derived from the filename property */
    contentType?: string | undefined;
    /** optional transfer encoding for the attachment, if not set it will be derived from the contentType property. Example values: quoted-printable, base64. If it is unset then base64 encoding is used for the attachment. If it is set to false then previous default applies (base64 for most, 7bit for text). */
    contentTransferEncoding?: '7bit' | 'base64' | 'quoted-printable' | false | undefined;
    /** optional content disposition type for the attachment, defaults to ‘attachment’ */
    contentDisposition?: 'attachment' | 'inline' | undefined;
    /** is an object of additional headers */
    headers?: Headers | undefined;
    /** an optional value that overrides entire node content in the mime message. If used then all other options set for this node are ignored. */
    raw?: string | Buffer | Readable | AttachmentLike | undefined;
}

interface AmpAttachment extends AttachmentLike {
    /** is an alternative for content to load the AMP4EMAIL data from an URL */
    href?: string | undefined;
    /** defines optional content encoding, eg. ‘base64’ or ‘hex’. This only applies if the content is a string. By default an unicode string is assumed. */
    encoding?: string | undefined;
    /** optional content type for the attachment, if not set will be derived from the filename property */
    contentType?: string | undefined;
    /** an optional value that overrides entire node content in the mime message. If used then all other options set for this node are ignored. */
    raw?: string | Buffer | Readable | AttachmentLike | undefined;
}

interface IcalAttachment extends AttachmentLike {
    /** optional method, case insensitive, defaults to ‘publish’. Other possible values would be ‘request’, ‘reply’, ‘cancel’ or any other valid calendar method listed in RFC5546. This should match the METHOD: value in calendar event file. */
    method?: string | undefined;
    /** optional filename, defaults to ‘invite.ics’ */
    filename?: string | false | undefined;
    /** is an alternative for content to load the calendar data from an URL */
    href?: string | undefined;
    /** defines optional content encoding, eg. ‘base64’ or ‘hex’. This only applies if the content is a string. By default an unicode string is assumed. */
    encoding?: string | undefined;
}

interface Envelope {
    /** the first address gets used as MAIL FROM address in SMTP */
    from?: string | undefined;
    /** addresses from this value get added to RCPT TO list */
    to?: string | undefined;
    /** addresses from this value get added to RCPT TO list */
    cc?: string | undefined;
    /** addresses from this value get added to RCPT TO list */
    bcc?: string | undefined;
}

export type TextEncoding = 'quoted-printable' | 'base64';

export type ListHeader = string | { url: string; comment: string };

export type ListHeaders = Record<string, ListHeader | ListHeader[] | ListHeader[][]>;

export interface DKIMOptionalOptions {
    /** optional location for cached messages. If not set then caching is not used. */
    cacheDir?: string | false | undefined;
    /** optional size in bytes, if message is larger than this treshold it gets cached to disk (assuming cacheDir is set and writable). Defaults to 131072 (128 kB). */
    cacheTreshold?: number | undefined;
    /** optional algorithm for the body hash, defaults to ‘sha256’ */
    hashAlgo?: string | undefined;
    /** an optional colon separated list of header keys to sign (eg. message-id:date:from:to...') */
    headerFieldNames?: string | undefined;
    /** optional colon separated list of header keys not to sign. This is useful if you want to sign all the relevant keys but your provider changes some values, ie Message-ID and Date. In this case you should use 'message-id:date' to prevent signing these values. */
    skipFields?: string | undefined;
}

export interface DKIMSingleKeyOptions extends DKIMOptionalOptions {
    /** is the domain name to use in the signature */
    domainName: string;
    /** is the DKIM key selector */
    keySelector: string;
    /** is the private key for the selector in PEM format */
    privateKey: string | { key: string; passphrase: string };
}

export interface DKIMMultipleKeysOptions extends DKIMOptionalOptions {
    /** is an optional array of key objects (domainName, keySelector, privateKey) if you want to add more than one signature to the message. If this value is set then the default key values are ignored */
    keys: DKIMSingleKeyOptions[];
}

export type DKIMOptions = DKIMSingleKeyOptions | DKIMMultipleKeysOptions;

/**
 * Options for sending an email.
 */
/**
 * Headers object for additional e-mail headers.
 *
 * This interface matches Nodemailer's expected headers type, allowing string keys with string, string array,
 * or prepared value objects.
 */
export type Headers = Record<string, string | string[] | { prepared: boolean; value: string }>;

/**
 * Options for sending an email.
 */
export interface SendMailOptions {
    /** The e-mail address of the sender. All e-mail addresses can be plain 'sender@server.com' or formatted 'Sender Name <sender@server.com>' */
    from?: string | Address | undefined;
    /** An e-mail address that will appear on the Sender: field */
    sender?: string | Address | undefined;
    /** Comma separated list or an array of recipients e-mail addresses that will appear on the To: field */
    to?: string | Address | (string | Address)[] | undefined;
    /** Comma separated list or an array of recipients e-mail addresses that will appear on the Cc: field */
    cc?: string | Address | (string | Address)[] | undefined;
    /** Comma separated list or an array of recipients e-mail addresses that will appear on the Bcc: field */
    bcc?: string | Address | (string | Address)[] | undefined;
    /** Comma separated list or an array of e-mail addresses that will appear on the Reply-To: field */
    replyTo?: string | Address | (string | Address)[] | undefined;
    /** The message-id this message is replying */
    inReplyTo?: string | Address | undefined;
    /** Message-id list (an array or space separated string) */
    references?: string | string[] | undefined;
    /** The subject of the e-mail */
    subject?: string | undefined;
    /** The plaintext version of the message */
    text?: string | Buffer | Readable | AttachmentLike | undefined;
    /** The HTML version of the message */
    html?: string | Buffer | Readable | AttachmentLike | undefined;
    /** Apple Watch specific HTML version of the message, same usage as with text and html */
    watchHtml?: string | Buffer | Readable | AttachmentLike | undefined;
    /** AMP4EMAIL specific HTML version of the message, same usage as with text and html. Make sure it is a full and valid AMP4EMAIL document, otherwise the displaying email client falls back to html and ignores the amp part */
    amp?: string | Buffer | Readable | AmpAttachment | undefined;
    /** iCalendar event, same usage as with text and html. Event method attribute defaults to ‘PUBLISH’ or define it yourself: {method: 'REQUEST', content: iCalString}. This value is added as an additional alternative to html or text. Only utf-8 content is allowed */
    icalEvent?: string | Buffer | Readable | IcalAttachment | undefined;
    /** An object or array of additional header fields */
    headers?: Headers | undefined;
    /** An object where key names are converted into list headers. List key help becomes List-Help header etc. */
    list?: ListHeaders | undefined;
    /** An array of attachment objects */
    attachments?: Attachment[] | undefined;
    /** An array of alternative text contents (in addition to text and html parts) */
    alternatives?: Attachment[] | undefined;
    /** optional SMTP envelope, if auto generated envelope is not suitable */
    envelope?: Envelope | undefined;
    /** optional Message-Id value, random value will be generated if not set */
    messageId?: string | undefined;
    /** optional Date value, current UTC string will be used if not set */
    date?: Date | string | undefined;
    /** optional transfer encoding for the textual parts */
    encoding?: string | undefined;
    /** if set then overwrites entire message output with this value. The value is not parsed, so you should still set address headers or the envelope value for the message to work */
    raw?: string | Buffer | Readable | AttachmentLike | undefined;
    /** set explicitly which encoding to use for text parts (quoted-printable or base64). If not set then encoding is detected from text content (mostly ascii means quoted-printable, otherwise base64) */
    textEncoding?: TextEncoding | undefined;
    /** if set to true then fails with an error when a node tries to load content from URL */
    disableUrlAccess?: boolean | undefined;
    /** if set to true then fails with an error when a node tries to load content from a file */
    disableFileAccess?: boolean | undefined;
    /** is an object with DKIM options */
    dkim?: DKIMOptions | undefined;
    /** method to normalize header keys for custom caseing */
    normalizeHeaderKey?(key: string): string;
    priority?: 'high' | 'normal' | 'low' | undefined;
    /** if set to true then converts data:images in the HTML content of message to embedded attachments */
    attachDataUrls?: boolean | undefined;
}

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
import { createTransport, type Transporter } from 'nodemailer';
import type { Options as SendMailOptions } from 'nodemailer/lib/mailer';

import { CoreError } from '#/error/coreError';
import { MAILER_KEY_ERROR } from '#/error/key/mailerKeyError';

export interface SMTPCredentials {
    user: string;
    pass: string;
}

export interface SMTPPoolOptions {
    maxConnections?: number;
}

export interface SMTPConfig {
    host: string;
    port?: number;
    secure?: boolean;
    credentials: SMTPCredentials;
    pool?: SMTPPoolOptions;
}

export class SMTP {
    private readonly _config: SMTPConfig;

    private _transporter: Transporter | null = null;

    public constructor(config: SMTPConfig) {
        this._config = {
            port: 587,
            secure: false,
            ...config
        };
    }

    public async connect(): Promise<void> {
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
            throw new CoreError({
                key: MAILER_KEY_ERROR.SMTP_CONNECTION_ERROR,
                message: 'An error occurred while connecting to the SMTP server',
                cause: error
            });
        }
    }

    public disconnect(): void {
        if (this._transporter) {
            this._transporter.close();
            this._transporter = null;
        }
    }

    public async sendMail(options: SendMailOptions): Promise<unknown> {
        if (!this._transporter)
            throw new CoreError({
                key: MAILER_KEY_ERROR.SMTP_NOT_CONNECTED,
                message: 'SMTP transporter is not connected.'
            });
        return this._transporter.sendMail(options);
    }
}
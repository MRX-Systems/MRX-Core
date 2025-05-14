/**
 * Mailer error key is a list of errors in the mailer context.
 * Each property represents a specific mailer error scenario.
 */
export const mailerKeyError = {
    /** Error when failing to connect to SMTP server. */
    smtpConnectionError: 'core.error.mailer.smtp.connection_error',
    /** Error when SMTP server is not connected. */
    smtpNotConnected: 'core.error.mailer.smtp.not_connected',
    /** Error when SMTP server is already connected. */
    smtpAlreadyConnected: 'core.error.mailer.smtp.already_connected'
} as const;
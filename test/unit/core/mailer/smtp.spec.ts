import { beforeAll, describe, expect, jest, mock, test } from 'bun:test';
import nodemailer from 'nodemailer';

describe('SMTP', () => {
    let testAccount: nodemailer.TestAccount;

    beforeAll(async () => {
        testAccount = await nodemailer.createTestAccount();
    });

    describe('constructor', () => {
        test('should create a new instance', async () => {
            const { SMTP } = await import('#/root/source/core/mailer/smtp');
            const mailer = new SMTP({
                host: testAccount.smtp.host,
                port: testAccount.smtp.port,
                credentials: {
                    user: testAccount.user,
                    pass: testAccount.pass
                },
                secure: testAccount.smtp.secure
            });
            expect(mailer).toBeInstanceOf(SMTP);
        });
    });

    describe('connect', () => {
        test('should connect to the SMTP server', async () => {
            const { SMTP } = await import('#/root/source/core/mailer/smtp');
            const mailer = new SMTP({
                host: testAccount.smtp.host,
                port: testAccount.smtp.port,
                credentials: {
                    user: testAccount.user,
                    pass: testAccount.pass
                },
                secure: testAccount.smtp.secure
            });
            await mailer.connect();
            expect(mailer['_transporter']).not.toBeNull();
        });

        test.todo('should throw an error if connection fails', async () => {
            const { SMTP } = await import('#/root/source/core/mailer/smtp');

            const mailer = new SMTP({
                host: 'invalid.host',
                port: 1234,
                credentials: {
                    user: 'invalidUser',
                    pass: 'invalidPass'
                },
                secure: false
            });

            await mock.module('nodemailer', () => ({
                createTransport: jest.fn().mockImplementation(() => ({
                    verify: jest.fn().mockRejectedValue(new Error('Connection failed'))
                }))
            }));

            expect(mailer.connect()).rejects.toThrow(Error);
            // TODO : maybe one day Bun fix RESTORE
            mock.restore(); // restore the original implementation but it doesn't work thanks to bun
        });
    });

    describe('disconnect', () => {
        test('should disconnect from the SMTP server', async () => {
            const { SMTP } = await import('#/root/source/core/mailer/smtp');
            const mailer = new SMTP({
                host: testAccount.smtp.host,
                port: testAccount.smtp.port,
                credentials: {
                    user: testAccount.user,
                    pass: testAccount.pass
                },
                secure: testAccount.smtp.secure
            });
            await mailer.connect();
            mailer.disconnect();
            expect(mailer['_transporter']).toBeNull();
        });
    });

    describe('sendMail', () => {
        test('should throw an error if not connected', async () => {
            const { SMTP } = await import('#/root/source/core/mailer/smtp');
            const mailer = new SMTP({
                host: testAccount.smtp.host,
                port: testAccount.smtp.port,
                credentials: {
                    user: testAccount.user,
                    pass: testAccount.pass
                },
                secure: testAccount.smtp.secure
            });
            expect(mailer.sendMail({})).rejects.toThrow('SMTP transporter is not connected.');
        });
    });
});
import { beforeAll, describe, expect, test } from 'bun:test';
import nodemailer from 'nodemailer';

import { MAILER_ERROR_KEYS } from '#/modules/mailer/enums/mailerErrorKeys';
import type { SMTPOptions } from '#/modules/mailer/types/smtpOptions';

describe('SMTP', () => {
	let testAccount: nodemailer.TestAccount;

	beforeAll(async () => {
		testAccount = await nodemailer.createTestAccount();
	});

	/**
	* Factory function to create SMTP configuration for testing.
	*/
	const createTestConfig = (overrides: Partial<SMTPOptions> = {}): SMTPOptions => ({
		host: testAccount.smtp.host,
		port: testAccount.smtp.port,
		credentials: {
			user: testAccount.user,
			pass: testAccount.pass
		},
		secure: testAccount.smtp.secure,
		...overrides
	});

	/**
	* Factory function to create SMTP instance for testing.
	*/
	const createTestSMTP = async (config?: Partial<SMTPOptions>) => {
		const { SMTP } = await import('#/modules/mailer/smtp');
		return new SMTP(createTestConfig(config));
	};

	describe('constructor', () => {
		test('should create a new instance with valid configuration', async () => {
			const mailer = await createTestSMTP();
			expect(mailer).toBeInstanceOf((await import('#/modules/mailer/smtp')).SMTP);
		});

		test('should apply default values for optional parameters', async () => {
			const { SMTP } = await import('#/modules/mailer/smtp');
			const config: SMTPOptions = {
				host: 'test.example.com',
				credentials: {
					user: 'testuser',
					pass: 'testpass'
				}
			};
			const mailer = new SMTP(config);

			// Access private config through bracket notation for testing
			expect(mailer['_config'].port).toBe(587);
			expect(mailer['_config'].secure).toBe(false);
		});

		test('should override default values with provided configuration', async () => {
			const { SMTP } = await import('#/modules/mailer/smtp');
			const config: SMTPOptions = {
				host: 'test.example.com',
				port: 465,
				secure: true,
				credentials: {
					user: 'testuser',
					pass: 'testpass'
				},
				pool: {
					maxConnections: 10
				}
			};
			const mailer = new SMTP(config);

			expect(mailer['_config'].port).toBe(465);
			expect(mailer['_config'].secure).toBe(true);
			expect(mailer['_config'].pool?.maxConnections).toBe(10);
		});
	});

	describe('connect', () => {
		test('should connect to the SMTP server successfully', async () => {
			const mailer = await createTestSMTP();
			await mailer.connect();
			expect(mailer['_transporter']).not.toBeNull();

			// Clean up
			mailer.disconnect();
		}, {
			timeout: 5500
		});

		test('should throw CoreError when already connected', async () => {
			const { BaseError } = await import('#/errors/baseError');

			const mailer = await createTestSMTP();
			await mailer.connect();

			expect(mailer.connect()).rejects.toThrow(BaseError);
			expect(mailer.connect()).rejects.toThrow(MAILER_ERROR_KEYS.SMTP_ALREADY_CONNECTED);

			// Clean up
			mailer.disconnect();
		});

		test('should throw CoreError when connection fails with invalid host', async () => {
			const { BaseError } = await import('#/errors/baseError');

			const mailer = await createTestSMTP({
				host: 'invalid.nonexistent.host.example',
				port: 1234
			});

			try {
				await mailer.connect();
			} catch (error) {
				expect(error).toBeInstanceOf(BaseError);
				expect((error as InstanceType<typeof BaseError>).message).toBe(MAILER_ERROR_KEYS.SMTP_CONNECTION_ERROR);
			}
		});

		test('should create transporter with correct pool configuration', async () => {
			const mailer = await createTestSMTP({
				pool: {
					maxConnections: 3
				}
			});

			await mailer.connect();

			// Verify the transporter was created (implementation detail test)
			expect(mailer['_transporter']).not.toBeNull();

			// Clean up
			mailer.disconnect();
		});
	});

	describe('disconnect', () => {
		test('should disconnect from the SMTP server', async () => {
			const mailer = await createTestSMTP();
			await mailer.connect();
			expect(mailer['_transporter']).not.toBeNull();

			mailer.disconnect();
			expect(mailer['_transporter']).toBeNull();
		});

		test('should handle disconnect when not connected', async () => {
			const mailer = await createTestSMTP();
			// Should not throw error
			expect(() => mailer.disconnect()).not.toThrow();
			expect(mailer['_transporter']).toBeNull();
		});

		test('should handle multiple disconnects gracefully', async () => {
			const mailer = await createTestSMTP();
			await mailer.connect();

			mailer.disconnect();
			expect(mailer['_transporter']).toBeNull();

			// Second disconnect should not throw
			expect(() => mailer.disconnect()).not.toThrow();
			expect(mailer['_transporter']).toBeNull();
		});
	});

	describe('sendMail', () => {
		test('should throw CoreError when not connected', async () => {
			const { BaseError } = await import('#/errors/baseError');

			const mailer = await createTestSMTP();

			expect(mailer.sendMail({})).rejects.toThrow(BaseError);
			expect(mailer.sendMail({})).rejects.toThrow(MAILER_ERROR_KEYS.SMTP_NOT_CONNECTED);
		});

		test('should send mail successfully when connected', async () => {
			const mailer = await createTestSMTP();
			await mailer.connect();

			const mailOptions = {
				from: testAccount.user,
				to: 'test@example.com',
				subject: 'Test Subject',
				text: 'Test Body'
			};

			const result = await mailer.sendMail(mailOptions);

			// Nodemailer test account should return a result object
			expect(result).toBeDefined();
			expect(typeof result).toBe('object');

			// Clean up
			mailer.disconnect();
		});

		test('should handle mail sending with HTML content', async () => {
			const mailer = await createTestSMTP();
			await mailer.connect();

			const mailOptions = {
				from: testAccount.user,
				to: 'test@example.com',
				subject: 'HTML Test',
				html: '<h1>Test HTML Content</h1>'
			};

			const result = await mailer.sendMail(mailOptions);
			expect(result).toBeDefined();

			// Clean up
			mailer.disconnect();
		});

		test('should handle mail sending with attachments', async () => {
			const mailer = await createTestSMTP();
			await mailer.connect();

			const mailOptions = {
				from: testAccount.user,
				to: 'test@example.com',
				subject: 'Attachment Test',
				text: 'Test with attachment',
				attachments: [
					{
						filename: 'test.txt',
						content: 'Test file content'
					}
				]
			};

			const result = await mailer.sendMail(mailOptions);
			expect(result).toBeDefined();

			// Clean up
			mailer.disconnect();
		});
	});
});

/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-empty-function */
import { describe, expect, test } from 'bun:test';

import { BaseError } from '#/errors/base-error';
import { LOGGER_ERROR_KEYS } from '#/modules/logger/enums/logger-error-keys';
import { Logger } from '#/modules/logger/logger';
import type { LogLevels } from '#/modules/logger/types/log-levels';
import type { LoggerSink } from '#/modules/logger/types/logger-sink';

/**
 * Tests for the Logger class (immutable API).
 */
describe('Logger', () => {
	describe('constructor', () => {
		test('should create a new instance of Logger with default maxPendingLogs', () => {
			const logger: Logger = new Logger();
			expect(logger).toBeInstanceOf(Logger);
		});

		test('should create a new instance of Logger with custom maxPendingLogs', () => {
			const logger: Logger = new Logger({}, 10);
			expect(logger).toBeInstanceOf(Logger);
		});
	});

	describe('registerSink', () => {
		test('should add a sink and return a new Logger instance', () => {
			const logger: Logger = new Logger();
			const sink: LoggerSink = { log: () => {} };
			const logger2 = logger.registerSink('test', sink);
			expect(Object.keys((logger2 as unknown as { _sinks: object })._sinks)).toContain('test');
		});

		test('should throw an error if the sink is already added', () => {
			const logger: Logger = new Logger();
			const sink: LoggerSink = { log: () => {} };
			const logger2 = logger.registerSink('test', sink);
			expect(() => logger2.registerSink('test', sink)).toThrow(LOGGER_ERROR_KEYS.SINK_ALREADY_ADDED);
		});
	});

	describe('unregisterSink', () => {
		test('should remove a sink and return a new Logger instance', () => {
			const logger: Logger = new Logger();
			const sink: LoggerSink = { log: () => {} };
			const logger2 = logger.registerSink('test', sink);
			// The key type is now 'test' only
			const logger3 = logger2.unregisterSink('test');
			expect(Object.keys((logger3 as unknown as { _sinks: object })._sinks)).not.toContain('test');
		});

		test('should throw an error if the sink is not found', () => {
			const logger: Logger = new Logger();
			// Type is never, so we must cast
			expect(() => (logger as unknown as { unregisterSink: (name: string) => void }).unregisterSink('test')).toThrow(LOGGER_ERROR_KEYS.SINK_NOT_FOUND);
		});
	});

	describe('registerSinks', () => {
		test('should add multiple sinks and return a new Logger instance', () => {
			const logger: Logger = new Logger();
			const sinks: [string, LoggerSink][] = [
				['test1', { log: () => {} }],
				['test2', { log: () => {} }]
			];
			const logger2 = logger.registerSinks(sinks);
			const keys = Object.keys((logger2 as unknown as { _sinks: object })._sinks);
			expect(keys).toContain('test1');
			expect(keys).toContain('test2');
		});

		test('should throw an error if a sink is already added', () => {
			const logger: Logger = new Logger();
			const sinks: [string, LoggerSink][] = [
				['test1', { log: () => {} }],
				['test2', { log: () => {} }]
			];
			const logger2 = logger.registerSinks(sinks);
			expect(() => logger2.registerSinks(sinks)).toThrow(LOGGER_ERROR_KEYS.SINK_ALREADY_ADDED);
		});
	});

	describe('unregisterSinks', () => {
		test('should remove multiple sinks and return a new Logger instance', () => {
			const logger: Logger = new Logger();
			const sinks: [string, LoggerSink][] = [
				['test1', { log: () => {} }],
				['test2', { log: () => {} }]
			];
			const logger2 = logger.registerSinks(sinks);
			// The keys are now 'test1' and 'test2'
			const logger3 = (logger2 as unknown as { unregisterSinks: (names: string[]) => Logger }).unregisterSinks(['test1', 'test2']);
			expect(Object.keys((logger3 as unknown as { _sinks: object })._sinks)).toHaveLength(0);
		});

		test('should throw an error if a sink is not found', () => {
			const logger: Logger = new Logger();
			const sinks: [string, LoggerSink][] = [
				['test1', { log: () => {} }],
				['test2', { log: () => {} }]
			];
			const logger2 = logger.registerSinks(sinks);
			expect(() => (logger2 as unknown as { unregisterSinks: (names: string[]) => Logger }).unregisterSinks(['test1', 'test3'])).toThrow(LOGGER_ERROR_KEYS.SINK_NOT_FOUND);
		});
	});

	describe('clearSinks', () => {
		test('should clear all sinks and return a new Logger instance', () => {
			const logger: Logger = new Logger();
			const sink: LoggerSink = { log: () => {} };
			const logger2 = logger.registerSink('test', sink);
			const logger3 = logger2.clearSinks();
			expect(Object.keys((logger3 as unknown as { _sinks: object })._sinks)).toHaveLength(0);
		});
	});

	describe('logging', () => {
		test.each([
			['error', 'ERROR'],
			['warn', 'WARN'],
			['info', 'INFO'],
			['debug', 'DEBUG'],
			['log', 'LOG']
		])('should log a %s message and queue it', (method: string, level: string) => {
			const sink: LoggerSink = {
				log: (logLevel: LogLevels, _: Date, object: unknown) => {
					expect(logLevel).toBe(level as LogLevels);
					expect(object).toBe('test');
				}
			};
			const logger = new Logger().registerSink('test', sink);
			((logger as unknown) as Record<string, (object: unknown) => void>)[method]('test');
			const pendingLogs = (logger as unknown as { _pendingLogs: unknown[] })._pendingLogs;
			expect(pendingLogs).toHaveLength(1);
			expect(pendingLogs[0]).toMatchObject({ level, object: 'test' });
		});

		test.each([
			['error'],
			['warn'],
			['info'],
			['debug'],
			['log']
		])('should throw if no sink is added (method: %s)', (method: string) => {
			const logger = new Logger();
			expect(() => ((logger as unknown) as Record<string, (object: unknown) => void>)[method]('test')).toThrow(LOGGER_ERROR_KEYS.NO_SINK_ADDED);
		});
	});

	describe('event emission', () => {
		test('should emit an error when a sink throws', (done) => {
			const sink: LoggerSink = {
				log: () => {
					throw new Error('test');
				}
			};
			const logger = new Logger().registerSink('test', sink);
			logger.on('error', (error: Error) => {
				expect(error).toBeInstanceOf(Error);
				expect(error).toBeInstanceOf(BaseError);
				done();
			});
			logger.log('test');
		});

		test('should emit end when no more logs are pending', (done) => {
			const sink: LoggerSink = { log: () => {} };
			const logger = new Logger().registerSink('test', sink);
			logger.on('end', () => done());
			logger.log('test');
		});
	});

	describe('internal behavior', () => {
		test('should ignore logs when maxPendingLogs is reached', () => {
			const sink: LoggerSink = { log: () => {} };
			const logger = new Logger().registerSink('test', sink);
			// Fill the buffer
			for (let i = 0; i < 10; ++i)
				logger.log(`log${i}`);
			const loggerFull = new Logger({}, 1).registerSink('test', sink);
			loggerFull.log('first');
			loggerFull.log('second');
			const pendingLogs = (loggerFull as unknown as { _pendingLogs: unknown[] })._pendingLogs;
			expect(pendingLogs).toHaveLength(1);
		});

		test('should handle backpressure in _writeLog', async () => {
			const mockSink: LoggerSink = {
				log: (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 100))
			};
			const logger = new Logger().registerSink('test', mockSink);
			logger.log('test1');
			logger.log('test2');
			// @ts-expect-error _writeLog is private
			await logger._writeLog();
		});
	});
});
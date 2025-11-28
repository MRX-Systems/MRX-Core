import { describe, expect, test } from 'bun:test';

import { Logger } from '#/modules/logger/logger';
import { ConsoleLoggerSink } from '#/modules/logger/sinks/console-logger';

describe('Logger', () => {
	// TODO: Implement Logger tests
	test('should pass', async () => {
		expect(true).toBe(true);

		const l = new Logger()
			.registerSink('console', ConsoleLoggerSink);
		l.warn('Test error message');
		await l.flush();
	});
});
import { describe, expect, test } from 'bun:test';

import { BaseError } from '#/errors/baseError';
import { parseHumanTimeToSeconds } from '#/modules/jwt/utils/parseHumanTimeToSeconds';

describe('parseHumanTimeToSeconds', () => {
	describe('basic time units', () => {
		test.each([
			// Seconds
			['1 second', 1],
			['5 seconds', 5],
			['30 secs', 30],
			['45 sec', 45],
			['60 s', 60],
			// Minutes
			['1 minute', 60],
			['5 minutes', 300],
			['15 mins', 900],
			['30 min', 1800],
			['60 m', 3600],
			// Hoursbun
			['1 hour', 3600],
			['2 hours', 7200],
			['12 hrs', 43200],
			['24 hr', 86400],
			['48 h', 172800],
			// Days
			['1 day', 86400],
			['7 days', 604800],
			['30 d', 2592000],
			// Weeks
			['1 week', 604800],
			['2 weeks', 1209600],
			['4 w', 2419200],
			// Years
			['1 year', 31557600], // 365.25 * 24 * 60 * 60
			['2 years', 63115200],
			['5 yrs', 157788000],
			['10 yr', 315576000],
			['1 y', 31557600]
		])('should parse "%s" correctly as %i seconds', (input, expected) => {
			expect(parseHumanTimeToSeconds(input)).toBe(expected);
		});
	});

	describe('decimal values', () => {
		test.each([
			// Decimal seconds
			['1.5 seconds', 2], // Rounded
			['2.7 secs', 3],
			['0.5 s', 1],
			// Decimal minutes
			['1.5 minutes', 90],
			['2.25 mins', 135],
			['0.5 m', 30],
			// Decimal hours
			['1.5 hours', 5400],
			['2.75 hrs', 9900],
			['0.25 h', 900],
			// Decimal days
			['1.5 days', 129600],
			['0.5 d', 43200]
		])('should parse decimal value "%s" as %i seconds', (input, expected) => {
			expect(parseHumanTimeToSeconds(input)).toBe(expected);
		});
	});

	describe('directional modifiers', () => {
		test.each([
			// "ago" suffix for past times
			['1 hour ago', -3600],
			['30 minutes ago', -1800],
			['2 days ago', -172800],
			['1 week ago', -604800],
			// "from now" suffix for future times
			['1 hour from now', 3600],
			['30 minutes from now', 1800],
			['2 days from now', 172800],
			['1 week from now', 604800],
			// Negative sign prefix
			['-1 hour', -3600],
			['-30 minutes', -1800],
			['-2 days', -172800],
			// Positive sign prefix
			['+1 hour', 3600],
			['+30 minutes', 1800],
			['+2 days', 172800]
		])('should handle directional modifier "%s" as %i seconds', (input, expected) => {
			expect(parseHumanTimeToSeconds(input)).toBe(expected);
		});
	});

	describe('whitespace handling', () => {
		test.each([
			['1hour', 3600], // Regex allows no space
			['1 hour', 3600],
			['+1 hour', 3600],
			['+ 1 hour', 3600],
			['-1hour', -3600],
			['- 1 hour', -3600],
			['1 hour from now', 3600],
			['1hour ago', -3600]
		])('should handle whitespace pattern "%s" as %i seconds', (input, expected) => {
			expect(parseHumanTimeToSeconds(input)).toBe(expected);
		});
	});

	describe('case insensitivity', () => {
		test.each([
			['1 HOUR', 3600],
			['30 Minutes', 1800],
			['2 Days', 172800],
			['1 week ago', -604800], // 'ago' must be lowercase
			['5 SECONDS', 5],
			['1 WEEK AGO', 604800], // AGO not recognized, treated as positive
			['1 hour from now', 3600]
		])('should handle case pattern "%s" as %i seconds', (input, expected) => {
			expect(parseHumanTimeToSeconds(input)).toBe(expected);
		});
	});

	describe('complex scenarios', () => {
		test.each([
			['15 mins', 900],
			['2.5 hours', 9000],
			['1 day ago', -86400],
			['+3 weeks', 1814400],
			['0.5 years', 15778800],
			['90 seconds', 90],
			['120 minutes', 7200],
			['36 hours', 129600]
		])('should handle real-world time expression "%s" as %i seconds', (input, expected) => {
			expect(parseHumanTimeToSeconds(input)).toBe(expected);
		});

		test.each([
			['0 seconds', 0],
			['0.1 seconds', 0], // Rounds to 0
			['1000 years', 31557600000]
		])('should handle edge case value "%s" as %i seconds', (input, expected) => {
			expect(parseHumanTimeToSeconds(input)).toBe(expected);
		});
	});

	describe('error handling', () => {
		test.each([
			'invalid format',
			'1',
			'hour',
			'1 invalid_unit',
			'abc hours',
			'1.2.3 minutes',
			'',
			'   ',
			'1 hour 30 minutes', // Multiple units not supported
			'1 hr 30 min',
			'next week',
			'last month'
		])('should throw BaseError for invalid format: "%s"', (input) => {
			expect(() => parseHumanTimeToSeconds(input)).toThrow(BaseError);

			try {
				parseHumanTimeToSeconds(input);
			} catch (error) {
				expect(error).toBeInstanceOf(BaseError);
				expect((error as BaseError).message).toBe('parse_human_time_to_seconds.error.invalid_time_expression');
			}
		});

		test.each([
			'1 century',
			'1 decade',
			'1 millisecond',
			'1 nanosecond',
			'1 fortnight'
		])('should throw BaseError for unknown time units: "%s"', (input) => {
			expect(() => parseHumanTimeToSeconds(input)).toThrow(BaseError);

			try {
				parseHumanTimeToSeconds(input);
			} catch (error) {
				expect(error).toBeInstanceOf(BaseError);
				expect((error as BaseError).message).toBe('parse_human_time_to_seconds.error.invalid_time_expression');
			}
		});

		test.each([
			'+1 hour ago', // Can't have both + and ago
			'-1 hour from now', // Can't have both - and from now
			'+5 minutes ago',
			'-10 seconds from now'
		])('should throw BaseError for conflicting signs and directions: "%s"', (input) => {
			expect(() => parseHumanTimeToSeconds(input)).toThrow(BaseError);

			try {
				parseHumanTimeToSeconds(input);
			} catch (error) {
				expect(error).toBeInstanceOf(BaseError);
				expect((error as BaseError).message).toBe('parse_human_time_to_seconds.error.invalid_time_expression');
			}
		});
	});

	describe('precision and rounding', () => {
		test.each([
			['1.4 seconds', 1],
			['1.5 seconds', 2],
			['1.6 seconds', 2],
			['2.9 seconds', 3]
		])('should round "%s" to nearest second as %i', (input, expected) => {
			expect(parseHumanTimeToSeconds(input)).toBe(expected);
		});

		test.each([
			['1.5 minutes', 90],
			['2.5 hours', 9000],
			['0.5 days', 43200],
			['1.5 weeks', 907200]
		])('should handle fractional calculation "%s" correctly as %i seconds', (input, expected) => {
			expect(parseHumanTimeToSeconds(input)).toBe(expected);
		});
	});

	describe('boundary testing', () => {
		test.each([
			['999999 seconds', 999999],
			['1000 years', 31557600000]
		])('should handle very large number "%s" as %i seconds', (input, expected) => {
			expect(parseHumanTimeToSeconds(input)).toBe(expected);
		});

		test.each([
			['0.001 seconds', 0],
			['0.999 seconds', 1]
		])('should handle very small decimal "%s" as %i seconds', (input, expected) => {
			expect(parseHumanTimeToSeconds(input)).toBe(expected);
		});
	});
});

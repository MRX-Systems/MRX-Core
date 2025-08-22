import { BaseError } from '#/errors/baseError';
import { PARSE_HUMAN_TIME_TO_SECONDS_ERROR_KEYS } from '#/modules/jwt/enums/parseHumanTimeToSecondsErrorKeys';

/**
 * Time unit constants in seconds
 */
const TIME_UNITS = {
	SECOND: 1,
	MINUTE: 60,
	HOUR: 60 * 60,
	DAY: 60 * 60 * 24,
	WEEK: 60 * 60 * 24 * 7,
	YEAR: 60 * 60 * 24 * 365.25
} as const;

/**
 * Regular expression to parse human-readable time expressions
 * Matches patterns like: "2 hours", "+30 minutes", "1 day ago", "5 seconds from now"
 */
const TIME_EXPRESSION_REGEX
    = /^(\+|-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i;

/**
 * Mapping of unit strings to their corresponding time unit values
 */
const UNIT_MAPPINGS: Record<string, number> = {
	// Seconds
	s: TIME_UNITS.SECOND,
	sec: TIME_UNITS.SECOND,
	secs: TIME_UNITS.SECOND,
	second: TIME_UNITS.SECOND,
	seconds: TIME_UNITS.SECOND,

	// Minutes
	m: TIME_UNITS.MINUTE,
	min: TIME_UNITS.MINUTE,
	mins: TIME_UNITS.MINUTE,
	minute: TIME_UNITS.MINUTE,
	minutes: TIME_UNITS.MINUTE,

	// Hours
	h: TIME_UNITS.HOUR,
	hr: TIME_UNITS.HOUR,
	hrs: TIME_UNITS.HOUR,
	hour: TIME_UNITS.HOUR,
	hours: TIME_UNITS.HOUR,

	// Days
	d: TIME_UNITS.DAY,
	day: TIME_UNITS.DAY,
	days: TIME_UNITS.DAY,

	// Weeks
	w: TIME_UNITS.WEEK,
	week: TIME_UNITS.WEEK,
	weeks: TIME_UNITS.WEEK,

	// Years
	y: TIME_UNITS.YEAR,
	yr: TIME_UNITS.YEAR,
	yrs: TIME_UNITS.YEAR,
	year: TIME_UNITS.YEAR,
	years: TIME_UNITS.YEAR
};

/**
 * Converts a human-readable time expression to seconds
 *
 * @param timeExpression - A string representing a time period (e.g., "2 hours", "30 minutes ago", "+1 day")
 *
 * @throws ({@link BaseError}) - If the time expression is invalid or contains an unknown unit
 *
 * @returns The time period in seconds (negative for past times)
*
 * @example
 * ```typescript
 * parseHumanTimeToSeconds("2 hours")      // Returns 7200
 * parseHumanTimeToSeconds("30 mins ago")  // Returns -1800
 * parseHumanTimeToSeconds("+1 day")       // Returns 86400
 * ```
 */
export const parseHumanTimeToSeconds = (timeExpression: string): number => {
	const match = TIME_EXPRESSION_REGEX.exec(timeExpression);

	if (!match || (match[4] && match[1]))
		throw new BaseError({
			message: PARSE_HUMAN_TIME_TO_SECONDS_ERROR_KEYS.INVALID_TIME_EXPRESSION
		});

	const [, sign, valueStr, unitStr, direction] = match;
	const value = parseFloat(valueStr);
	const unit = unitStr.toLowerCase();

	const multiplier = UNIT_MAPPINGS[unit];
	const seconds = Math.round(value * multiplier);

	// Return negative value for past times (ago or negative sign)
	if (sign === '-' || direction === 'ago')
		return -seconds;

	return seconds;
};
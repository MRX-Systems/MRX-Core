/**
 * Effects for text in the console like bold, italic, underline, etc.
 */
export const textEffects = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    italic: '\x1b[3m',
    underline: '\x1b[4m',
    inverse: '\x1b[7m',
    hidden: '\x1b[8m',
    strikethrough: '\x1b[9m'
} as const;

/**
 * Colors for text in the console.
 */
export const textColors = {
    reset: '\x1b[0m',
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    lightGray: '\x1b[37m',
    darkGray: '\x1b[90m',
    lightRed: '\x1b[91m',
    lightGreen: '\x1b[92m',
    lightYellow: '\x1b[93m',
    lightBlue: '\x1b[94m',
    lightMagenta: '\x1b[95m',
    lightCyan: '\x1b[96m',
    white: '\x1b[97m'
} as const;

/**
 * Background colors for text in the console.
 */
export const backgroundColors = {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    lightGray: '\x1b[47m',
    darkGray: '\x1b[100m',
    lightRed: '\x1b[101m',
    lightGreen: '\x1b[102m',
    lightYellow: '\x1b[103m',
    lightBlue: '\x1b[104m',
    lightMagenta: '\x1b[105m',
    lightCyan: '\x1b[106m',
    white: '\x1b[107m'
} as const;

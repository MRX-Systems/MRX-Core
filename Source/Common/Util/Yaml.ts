import { env } from 'process';
import { parse as parseYml, stringify as stringifyYml } from 'yaml';

/**
 * Replace the environment variables in the object.
 *
 * @param obj - The object to replace the environment variables.
 *
 * @returns The object with the environment variables replaced.
 */
function replaceEnvVars(obj: Record<string, unknown>): Record<string, unknown> {
    for (const key in obj)
        if (typeof obj[key] === 'string')
            obj[key] = (obj[key] as string)
                .replace(/\$\{(?:.+?)\}/g, (match: string) => {
                    const envVar = match.substring(2, match.length - 1);
                    return env[envVar] ?? '';
                });
        else if (typeof obj[key] === 'object')
            obj[key] = replaceEnvVars(obj[key] as Record<string, unknown>);
    return obj;
}

/**
 * Parse the yml string.
 *
 * @param yml - The yml string to parse.
 *
 * @returns The parsed object.
 */
function parse(yml: string): Record<string, unknown> {
    const obj: Record<string, unknown> = parseYml(yml);
    return replaceEnvVars(obj);
}

/**
 * Stringify the object to yml.
 *
 * @param obj - THe object to stringify.
 *
 * @returns The stringified object.
 */
function stringify(obj: Record<string, unknown>): string {
    return stringifyYml(obj);
}

export {
    parse,
    stringify
};

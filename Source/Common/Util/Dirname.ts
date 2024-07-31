import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Gets the directory name. (__dirname in CommonJS) in ESM.
 *
 * @returns The directory name.
 */
export function getDirname(): string {
    return path.dirname(fileURLToPath(import.meta.url));
}
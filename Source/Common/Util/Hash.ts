import { type Hash as TypeHash, createHash } from 'crypto';

/**
 * Hash the given data using MD5.
 *
 * @param data - The data to hash.
 *
 * @returns The MD5 hash of the data.
 */
export function md5(data: unknown): string {
    const str: string = typeof data === 'string' ? data : JSON.stringify(data);
    const hash: TypeHash = createHash('md5');
    return hash.update(str).digest('hex');
}

/**
 * Hash the given data using SHA-256.
 *
 * @param data - The data to hash.
 *
 * @returns The SHA-256 hash of the data.
 */
export function sha256(data: unknown): string {
    const str: string = typeof data === 'string' ? data : JSON.stringify(data);
    const hash: TypeHash = createHash('sha256');
    return hash.update(str).digest('hex');
}

/**
 * Hash the given data using SHA-512.
 *
 * @param data - The data to hash.
 *
 * @returns The SHA-512 hash of the data.
 */
export function sha512(data: unknown): string {
    const str: string = typeof data === 'string' ? data : JSON.stringify(data);
    const hash: TypeHash = createHash('sha512');
    return hash.update(str).digest('hex');
}
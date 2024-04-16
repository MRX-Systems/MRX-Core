import { type Hash as TypeHash, createHash } from 'crypto';

function md5(data: unknown): string {
    const str: string = typeof data === 'string' ? data : JSON.stringify(data);
    const hash: TypeHash = createHash('md5');
    return hash.update(str).digest('hex');
}

function sha256(data: unknown): string {
    const str: string = typeof data === 'string' ? data : JSON.stringify(data);
    const hash: TypeHash = createHash('sha256');
    return hash.update(str).digest('hex');
}

function sha512(data: unknown): string {
    const str: string = typeof data === 'string' ? data : JSON.stringify(data);
    const hash: TypeHash = createHash('sha512');
    return hash.update(str).digest('hex');
}

export const Hash = {
    md5,
    sha256,
    sha512,
};
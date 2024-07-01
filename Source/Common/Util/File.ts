import {
    readFileSync,
    watchFile,
    writeFileSync,
    type Stats,
    createReadStream,
} from 'fs';
import { createHash } from 'crypto';

import { AndesiteError } from '@/Common/Error';
import { CommonErrorKeys } from '@/Common/Error/Enum';
import { Path } from './Path';
import { Hash } from './Hash';

/**
 * Represents the file. extends ({@link Path})
 */
export class File extends Path {
    /**
     * Initializes a new instance of the File class.
     *
     * @param path - The path of the file.
     */
    public constructor(path: string) {
        super(path);
    }

    /**
     * Writes the file.
     *
     * @param content - The content to write to the file.
     *
     * @throws ({@link AndesiteError}) If the file access is denied. ({@link CommonErrorKeys.ERROR_ACCESS_FILE})
     * @throws ({@link AndesiteError}) If the file write fails. ({@link CommonErrorKeys.ERROR_WRITE_FILE})
     */
    public write(content: string): void {
        if (this.exists() && !this.checkAccess())
            throw new AndesiteError({
                messageKey: CommonErrorKeys.ERROR_ACCESS_FILE,
                detail: this._path
            });
        try {
            writeFileSync(this._path, content);
        } catch (error) {
            throw new AndesiteError({
                messageKey: CommonErrorKeys.ERROR_WRITE_FILE,
                detail: this._path
            });
        }
    }

    /**
     * Reads the file.
     *
     * @throws ({@link AndesiteError}) If the file access is denied. ({@link CommonErrorKeys.ERROR_ACCESS_FILE})
     * @throws ({@link AndesiteError}) If the file read fails. ({@link CommonErrorKeys.ERROR_READ_FILE})
     *
     * @returns The content of the file.
     */
    public read(): string {
        if (!this.checkAccess())
            throw new AndesiteError({
                messageKey: CommonErrorKeys.ERROR_ACCESS_FILE,
                detail: this._path
            });
        try {
            return readFileSync(this._path, 'utf8');
        } catch (error) {
            throw new AndesiteError({
                messageKey: CommonErrorKeys.ERROR_READ_FILE,
                detail: this._path
            });
        }
    }

    /**
     * Watches the file.
     *
     * @param interval - The interval to watch the file.
     * @param callback - The callback to execute when the file changes.
     */
    public watch(interval: number, callback: () => void): void {
        watchFile(this._path, { persistent: true, interval }, (curr: Stats, prev: Stats) => {
            if (curr.mtimeMs !== prev.mtimeMs)
                callback();
        });
    }

    /**
     * Calculates the hash of the file asynchronously with a stream.
     *
     * @returns The hash of the file.
     */
    public calculateStreamHashMD5(): Promise<string> {
        const hash = createHash('md5');
        const stream = createReadStream(this._path);

        return new Promise((resolve, reject) => {
            stream.on('data', (data) => hash.update(data));
            stream.on('end', () => {
                resolve(hash.digest('hex'));
            });
            stream.on('error', (error) => reject(error));
        });
    }

    /**
     * Calculates the hash of the file.
     *
     * @returns The hash of the file.
     */
    public calculateHashMD5(): string {
        const data = this.read();
        return Hash.md5(data);
    }
}

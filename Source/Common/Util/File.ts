import {
    readFileSync,
    watchFile,
    writeFileSync,
    type Stats,
} from 'fs';

import { CommonErrorKeys } from '@/Common/Error/Enum/index.js';
import { AndesiteError } from '@/Common/Error/index.js';
import { Path } from './Path.js';

/**
 * Interface for the file options.
 */
export interface IFileOptions {
    /**
     * The path of the file.
     */
    path: string;

    /**
     * The content of the file.
     */
    content?: string;
}

/**
 * Represents the file. extends ({@link Path})
 */
export class File extends Path {
    /**
     * The content of the file.
     */
    protected _content: string;

    /**
     * Initializes a new instance of the File class.
     *
     * @param options - The options of the file. ({@link IFileOptions})
     */
    public constructor(options: IFileOptions) {
        super(options.path);
        this._content = options.content ?? '';
    }

    /**
     * Gets the content of the file.
     *
     * @returns The content of the file.
     */
    public get content(): string {
        return this._content;
    }

    /**
     * Writes the file.
     *
     * @param content - The content to write to the file.
     *
     * @throws ({@link AndesiteError}) If the file access is denied. ({@link CommonErrorKeys.ERROR_ACCESS_FILE})
     * @throws ({@link AndesiteError}) If the file write fails. ({@link CommonErrorKeys.ERROR_WRITE_FILE})
     */
    public write(content: string = this._content): void {
        if (this.checkAccess())
            throw new AndesiteError({
                messageKey: CommonErrorKeys.ERROR_ACCESS_FILE,
                detail: this._path
            });
        this._content = content;
        try {
            writeFileSync(this._path, this._content);
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
            this._content = readFileSync(this._path, 'utf8');
        } catch (error) {
            throw new AndesiteError({
                messageKey: CommonErrorKeys.ERROR_READ_FILE,
                detail: this._path
            });
        }
        return this._content;
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
}

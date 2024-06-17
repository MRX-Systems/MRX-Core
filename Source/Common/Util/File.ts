import {
    writeFileSync,
    readFileSync,
} from 'fs';

import { AndesiteError } from '@/Common/Error';
import { ServiceErrorKeys } from '@/Common/Error/Enum';
import { Path } from './Path';

export interface IFileOptions {
    /**
     * The path of the file.
     */
    path: string;

    /**
     * The content of the file.
     */
    content: string;
}

export class File extends Path {
    /**
     * The content of the file.
     */
    private _content: string;

    /**
     * Initializes a new instance of the File class.
     * 
     * @param options - The options of the file.
     */
    public constructor(options: IFileOptions) {
        super(options.path);
        this._content = options.content;
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
     * @throws ({@link AndesiteError}) If the file access is denied. ({@link ServiceErrorKeys.ERROR_ACCESS_FILE})
     */
    public write(): void {
        if (this.checkAccess())
            throw new AndesiteError({
                messageKey: ServiceErrorKeys.ERROR_ACCESS_FILE,
                detail: this._path
            });
        writeFileSync(this._path, this._content);
    }

    /**
     * Reads the file.
     * 
     * @throws ({@link AndesiteError}) If the file access is denied. ({@link ServiceErrorKeys.ERROR_ACCESS_FILE})
     * 
     * @returns The content of the file.
     */
    public read(): string {
        if (!this.checkAccess())
            throw new AndesiteError({
                messageKey: ServiceErrorKeys.ERROR_ACCESS_FILE,
                detail: this._path
            });
        this._content = readFileSync(this._path, 'utf8');
        return this._content;
    }
}
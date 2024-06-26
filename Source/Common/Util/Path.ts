import {
    accessSync,
    constants,
    existsSync,
} from 'fs';
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

/**
 * Represents the path.
 */
export class Path {
    /**
     * It's a path.
     */
    protected readonly _path: string;

    /**
     * Initializes a new instance of the Path class.
     *
     * @param path - The path.
     */
    public constructor(path: string) {
        this._path = path;
    }

    /**
     * Gets the path of the file.
     *
     * @returns The path of the file.
     */
    public get path(): string {
        return this._path;
    }

    /**
     * Checks the access of the folder. ({@link constants.F_OK}, {@link constants.W_OK}, {@link constants.R_OK})
     *
     * @returns True if the folder has access; otherwise, false.
     */
    public checkAccess(): boolean {
        try {
            accessSync(this._path, constants.F_OK || constants.W_OK || constants.R_OK);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Checks if the path exists.
     *
     * @returns True if the path exists; otherwise, false.
     */
    public exists(): boolean {
        return existsSync(this._path);
    }
}

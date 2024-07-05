import {
    mkdirSync
} from 'fs';

import { CommonErrorKeys } from '@/Common/Error/Enum/index.js';
import { AndesiteError } from '@/Common/Error/index.js';
import { Path } from './Path.js';

/**
 * Represents the folder. extends ({@link Path})
 */
export class Folder extends Path {
    /**
     * Initializes a new instance of the Folder class.
     *
     * @param path - The path of the folder.
     */
    public constructor(path: string) {
        super(path);
    }

    /**
     * Builds the folder structure.
     *
     * @param structure - The folder structure.
     *
     * @throws ({@link AndesiteError}) - If failed to create folder structure. ({@link CommonErrorKeys.ERROR_CREATE_FOLDER_STRUCTURE})
     * @throws ({@link AndesiteError}) - If failed to access folder. ({@link CommonErrorKeys.ERROR_ACCESS_FOLDER})
     */
    public build(structure: Record<string, unknown>): void {
        const createFolderStructure = (structure: Record<string, unknown>, parentPath: string): void => {
            for (const key in structure)
                if (Object.hasOwn(structure, key) && (structure[key] === undefined || structure[key] === null))
                    try {
                        const path = new Path(`${parentPath}/${key}`);
                        if (!path.exists())
                            mkdirSync(path.path, { recursive: true });

                    } catch (e) {
                        throw new AndesiteError({
                            messageKey: CommonErrorKeys.ERROR_CREATE_FOLDER_STRUCTURE,
                            detail: e
                        });
                    }
                else
                    createFolderStructure(structure[key] as Record<string, unknown>, `${parentPath}/${key}`);
        };
        if (!this.checkAccess())
            throw new AndesiteError({
                messageKey: CommonErrorKeys.ERROR_ACCESS_FOLDER,
                detail: this._path
            });
        createFolderStructure(structure, this._path);
    }
}

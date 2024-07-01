import {
    mkdirSync
} from 'fs';

import { AndesiteError } from '@/Common/Error/index.js';
import { CommonErrorKeys } from '@/Common/Error/Enum/index.js';
import { Path } from './Path.js';

/**
 * Represents the folder options.
 */
export interface IFolderOptions {
    /**
     * The structure of the folder.
     */
    structure: Record<string, unknown>;
    /**
     * The path where the folder is located.
     */
    path: string;
}

/**
 * Represents the folder. extends ({@link Path})
 */
export class Folder extends Path {
    /**
     * The structure of the folder.
     */
    private readonly _structure: Record<string, unknown>;

    /**
     * Initializes a new instance of the Folder class.
     *
     * @param options - The options of the folder. ({@link IFolderOptions})
     */
    public constructor(options: IFolderOptions) {
        super(options.path);
        this._structure = options.structure;
    }

    /**
     * Gets the structure of the folder.
     *
     * @returns The structure of the folder.
     */
    public get structure(): Record<string, unknown> {
        return this._structure;
    }

    /**
     * Builds the folder structure.
     *
     * @throws ({@link AndesiteError}) - If failed to create folder structure. ({@link CommonErrorKeys.ERROR_CREATE_FOLDER_STRUCTURE})
     * @throws ({@link AndesiteError}) - If failed to access folder. ({@link CommonErrorKeys.ERROR_ACCESS_FOLDER})
     */
    public build(): void {
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
        createFolderStructure(this._structure, this._path);
    }
}

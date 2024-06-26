import andesiteFolderStructure from '@/../Templates/FolderStructure/andesite.json' with { type: 'json' };
import { Folder } from '@/Common/Util/index.js';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CommonErrorKeys } from '@/Common/Error/Enum/index.js';

/**
 * Create the Andesite folder structure.
 *
 * @throws ({@link AndesiteError}) - If failed to create folder structure. ({@link CommonErrorKeys.ERROR_CREATE_FOLDER_STRUCTURE})
 * @throws ({@link AndesiteError}) - If failed to access folder. ({@link CommonErrorKeys.ERROR_ACCESS_FOLDER})
 *
 * @param path - The parent path of the folder structure. (default: './')
 */
function initAndesiteFolderStructure(path: string = './'): void {
    const folder = new Folder({ structure: andesiteFolderStructure, path });
    folder.build();
}

export {
    initAndesiteFolderStructure
};

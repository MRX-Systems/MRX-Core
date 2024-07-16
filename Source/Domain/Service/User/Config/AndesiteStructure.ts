import andesiteFolderStructure from '@/../Templates/FolderStructure/andesite.json' with { type: 'json' };
import { Folder } from '@/Common/Util/index.js';

/**
 * Create the Andesite folder structure.
 *
 * @throws ({@link AndesiteError}) - If failed to create folder structure. ({@link CommonErrorKeys.ERROR_CREATE_FOLDER_STRUCTURE})
 * @throws ({@link AndesiteError}) - If failed to access folder. ({@link CommonErrorKeys.ERROR_ACCESS_FOLDER})
 *
 * @param path - The parent path of the folder structure. (default: './')
 */
export function initAndesiteFolderStructure(path: string = './'): void {
    const folder = new Folder(path);
    folder.build(andesiteFolderStructure);
}

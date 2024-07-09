import apiStructure from '@/../Templates/FolderStructure/api.json' with { type: 'json' };
import scriptStructure from '@/../Templates/FolderStructure/sample-script.json' with { type: 'json' };
import { Folder } from '@/Common/Util/index.js';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CommonErrorKeys } from '@/Common/Error/Enum/index.js';

/**
 * Creates the folder structure based on the project information.
 *
 * @param type - The project type.
 * @param path - The parent path of the folder structure.
 *
 * @throws ({@link AndesiteError}) - If failed to create folder structure. ({@link CommonErrorKeys.ERROR_CREATE_FOLDER_STRUCTURE})
 * @throws ({@link AndesiteError}) - If failed to access folder. ({@link CommonErrorKeys.ERROR_ACCESS_FOLDER})
 */
export function initFolderStructure(type: string, path: string = './'): void {
    if (type === 'API')
        new Folder(path).build(apiStructure);
    if (type === 'Script')
        new Folder(path).build(scriptStructure);
}

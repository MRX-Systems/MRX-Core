import apiStructure from '@/../Templates/FolderStructure/api.json';
import sampleScriptStructure from '@/../Templates/FolderStructure/sample-script.json';
import { Folder } from '@/Common/Util';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CommonErrorKeys } from '@/lib';

/**
 * Creates the folder structure based on the project information.
 *
 * @param type - The project type.
 * @param path - The parent path of the folder structure.
 *
 * @throws ({@link AndesiteError}) - If failed to create folder structure. ({@link CommonErrorKeys.ERROR_CREATE_FOLDER_STRUCTURE})
 * @throws ({@link AndesiteError}) - If failed to access folder. ({@link CommonErrorKeys.ERROR_ACCESS_FOLDER})
 */
function initFolderStructure(type: string, path: string = './'): void {
    if (type === 'API') {
        const apiFolder = new Folder({
            path,
            structure: apiStructure
        });
        apiFolder.build();
    } if (type === 'Sample Script') {
        const sampleScriptFolder = new Folder({
            path,
            structure: sampleScriptStructure
        });
        sampleScriptFolder.build();
    }
}

export {
    initFolderStructure
};

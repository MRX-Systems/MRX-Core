import { buildFolderStructureByObject } from '@/Common/Util';
import apiStructure from '@/../Templates/FolderStructure/Api.json';
import workerManagerStructure from '@/../Templates/FolderStructure/WorkerManager.json';
import libraryStructure from '@/../Templates/FolderStructure/Library.json';
import sampleScriptStructure from '@/../Templates/FolderStructure/SampleScript.json';

/**
 * Creates the folder structure based on the project information.
 * 
 * @param type - The project type.
 * @param path - The parent path of the folder structure.
 * 
 * @throws {@link AndesiteError} - If failed to create folder structure. {@link ServiceErrorKeys.ERROR_CREATE_FOLDER_STRUCTURE}
 */
function createFolderStructure(type: string, path: string = './example'): void {
    switch (type) {
    case 'API':
        buildFolderStructureByObject(apiStructure as Record<string, unknown>, path);
        break;
    case 'Worker Manager':
        buildFolderStructureByObject(workerManagerStructure as Record<string, unknown>, path);
        break;
    case 'Library':
        buildFolderStructureByObject(libraryStructure as Record<string, unknown>, path);
        break;
    case 'Sample Script':
        buildFolderStructureByObject(sampleScriptStructure as Record<string, unknown>, path);
        break;
    default:
        buildFolderStructureByObject(apiStructure as Record<string, unknown>, path);
    }
}

export const __test__ = {
    createFolderStructure
};

export {
    createFolderStructure
};

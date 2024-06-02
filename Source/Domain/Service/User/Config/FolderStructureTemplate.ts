import apiStructure from '@/../Templates/FolderStructure/api.json';
import sampleScriptStructure from '@/../Templates/FolderStructure/sample-script.json';
import { buildFolderStructureByObject } from '@/Common/Util';

/**
 * Creates the folder structure based on the project information.
 * 
 * @param type - The project type.
 * @param path - The parent path of the folder structure.
 */
function initFolderStructure(type: string, path: string = './'): void {
    switch (type) {
    case 'API':
        buildFolderStructureByObject(apiStructure as Record<string, unknown>, path);
        break;
    case 'Sample Script':
        buildFolderStructureByObject(sampleScriptStructure as Record<string, unknown>, path);
        break;
    default:
        buildFolderStructureByObject(apiStructure as Record<string, unknown>, path);
    }
}

export {
    initFolderStructure
};

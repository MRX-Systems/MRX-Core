import andesiteFolderStructure from '@/../Templates/FolderStructure/Andesite.json';
import { buildFolderStructureByObject } from '@/Common/Util';

/**
 * Create the Andesite folder structure.
 * 
 * @param path - The parent path of the folder structure.
 */
function createAndesiteFolderStructure(path: string = './example'): void {
    buildFolderStructureByObject(andesiteFolderStructure, path);
}

export {
    createAndesiteFolderStructure
};

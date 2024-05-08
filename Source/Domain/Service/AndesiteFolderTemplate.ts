import andesiteFolderStructure from '@/../Templates/FolderStructure/andesite.json';
import { buildFolderStructureByObject } from '@/Common/Util';

/**
 * Create the Andesite folder structure.
 * 
 * @param path - The parent path of the folder structure.
 */
function initAndesiteFolderStructure(path: string = './'): void {
    buildFolderStructureByObject(andesiteFolderStructure, path);
}

export {
    initAndesiteFolderStructure
};

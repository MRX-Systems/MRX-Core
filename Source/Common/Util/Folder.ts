import {
    existsSync,
    mkdirSync
} from 'fs';

import { AndesiteError } from '@/Common/Error';
import { ServiceErrorKeys } from '@/Common/Error/Enum';

/**
 * Builds the folder structure by the object.
 * 
 * @param obj - The object that represents the folder structure.
 * @param parentPath - The parent path of the folder structure.
 * 
 * @throws ({@link AndesiteError}) - If failed to create folder structure. ({@link ServiceErrorKeys.CREATE_FOLDER_STRUCTURE_ERROR})
 */
function buildFolderStructureByObject(obj: Record<string, unknown>, parentPath: string = './example'): void {
    for (const key in obj)
        if (obj[key] === undefined || obj[key] === null) {
            const path = `${parentPath}/${key}`;
            try {
                if (!existsSync(path))
                    mkdirSync(path, { recursive: true });
            } catch (e) {
                throw new AndesiteError({
                    messageKey: ServiceErrorKeys.CREATE_FOLDER_STRUCTURE_ERROR,
                    detail: e
                });
            }
        } else {
            buildFolderStructureByObject(obj[key] as Record<string, unknown>, `${parentPath}/${key}`);
        }
}

export {
    buildFolderStructureByObject
};

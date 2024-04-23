import {
    existsSync,
    mkdirSync
} from 'fs';

import { AndesiteError } from '@/Common/Error';
import { ServiceErrorKeys } from '@/Common/Error/Enum';
import { type IProjectInformation } from '@/Domain/Interface';

const apiStructure = {
    Source: {
        Common: {
            Error: {
                Enum: undefined
            },
            Lang: undefined,
            Util: undefined
        },
        Config: undefined,
        Domain: {
            Entity: undefined,
            Interface: undefined,
            Service: undefined,
            UseCase: undefined
        },
        DTO: undefined,
        Infrastructure: {
            Database: undefined,
            Repository: undefined
        },
        Presentation: {
            Http: {
                Handler: undefined,
                Middleware: undefined,
                Router: undefined
            },
            Schema: undefined,
            Websocket: {
                Handler: undefined,
                Middleware: undefined,
                Router: undefined
            }
        }
    }
};

/**
 * Builds the folder structure by the object.
 * 
 * @param obj - The object that represents the folder structure.
 * @param parentPath - The parent path of the folder structure.
 * 
 * @throws {@link AndesiteError} - If failed to create folder structure. {@link ServiceErrorKeys.CREATE_FOLDER_STRUCTURE_ERROR}
 */
function buildFolderStructureByObject(obj: Record<string, unknown>, parentPath: string = '.'): void {
    for (const key in obj)
        if (obj[key] === undefined) {
            const path = `${parentPath}/${key}`;
            try {
                if (!existsSync(path))
                    mkdirSync(path, { recursive: true });
            } catch {
                throw new AndesiteError({
                    messageKey: ServiceErrorKeys.CREATE_FOLDER_STRUCTURE_ERROR,
                    detail: `Failed to create folder structure at ${path}`
                });
            }
        } else {
            buildFolderStructureByObject(obj[key] as Record<string, unknown>, `${parentPath}/${key}`);
        }
}

/**
 * Creates the folder structure based on the project information.
 * 
 * @param projectInformation - The project information.
 * 
 * @throws {@link AndesiteError} - If failed to create folder structure. {@link ServiceErrorKeys.CREATE_FOLDER_STRUCTURE_ERROR}
 */
function createFolderStructure(projectInformation: IProjectInformation): void {
    switch (projectInformation.type) {
    case 'API':
        buildFolderStructureByObject(apiStructure);
        break;
    case 'Worker Manager':
        break;
    case 'Library':
        break;
    case 'Sample Script':
        break;
    default:
        buildFolderStructureByObject(apiStructure);
    }
}

export {
    createFolderStructure
};

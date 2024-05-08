import { buildFolderStructureByObject } from '@/Common/Util';

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
            Entity: {
                __Static__: undefined,
                __Dynamic__: undefined
            },
            Interface: undefined,
            Service: undefined,
            UseCase: undefined
        },
        DTO: undefined,
        Infrastructure: {
            Database: {
                __Static__: undefined,
                __Dynamic__: undefined
            },
            Repository: undefined
        },
        Presentation: {
            Http: {
                Handler: undefined,
                Middleware: undefined,
                Router: undefined
            },
            Schema: undefined,
            WebSocket: {
                Handler: undefined,
                Middleware: undefined,
                Router: undefined
            }
        }
    }
};

const workerManagerStructure = {
    Source: {
        Common: {
            Error: {
                Enum: undefined
            },
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
            Worker: {
                Strategy: undefined
            }
        }
    }
};

const libraryStructure = {
    Source: {
        Common: {
            Error: {
                Enum: undefined
            },
            Util: undefined
        },
        Config: undefined,
        Domain: {
            Interface: undefined,
            Service: undefined,
            UseCase: undefined
        },
    }
};

const sampleScriptStructure = {
    Source: undefined
};

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
        buildFolderStructureByObject(apiStructure, path);
        break;
    case 'Worker Manager':
        buildFolderStructureByObject(workerManagerStructure, path);
        break;
    case 'Library':
        buildFolderStructureByObject(libraryStructure, path);
        break;
    case 'Sample Script':
        buildFolderStructureByObject(sampleScriptStructure, path);
        break;
    default:
        buildFolderStructureByObject(apiStructure, path);
    }
}

export const __test__ = {
    createFolderStructure
};

export {
    createFolderStructure
};

import {
    existsSync,
    writeFileSync
} from 'fs';

import { AndesiteError } from '@/Common/Error';
import { ServiceErrorKeys } from '@/Common/Error/Enum';

/**
 * Initialize the entry point of the project.
 * 
 * @param path - The path where the entry point will be created.
 */
function initEntryPoint(path: string = './'): void {
    if (existsSync(`${path}/Source/App.ts`))
        throw new AndesiteError({
            messageKey: ServiceErrorKeys.ERROR_ENTRY_POINT_EXISTS
        });
    writeFileSync(`${path}/Source/App.ts`, 'console.log("Hello, World!");');
}

export {
    initEntryPoint
};

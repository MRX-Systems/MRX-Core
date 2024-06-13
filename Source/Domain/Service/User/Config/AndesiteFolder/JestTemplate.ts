import {
    existsSync,
    writeFileSync
} from 'fs';

import jest from '@/../Templates/jest.json';
import { AndesiteError } from '@/Common/Error';
import { ServiceErrorKeys } from '@/Common/Error/Enum';

/**
 * Create a jest.config.json file.
 *
 * @param projectName - The name of the project.
 * @param path - The parent path of the jest.config.json.
 *
 * @throws ({@link AndesiteError}) - If jest.config.json already exists. ({@link ServiceErrorKeys.ERROR_JEST_EXISTS})
 */
function initJestConfig(
    projectName: string,
    path: string = './'
): void {
    if (existsSync(`${path}/jest.config.json`))
        throw new AndesiteError({
            messageKey: ServiceErrorKeys.ERROR_JEST_EXISTS
        });
    jest.displayName = projectName;
    writeFileSync(`${path}/.andesite/jest.config.json`, JSON.stringify(jest, null, 2));
}

export {
    initJestConfig
};

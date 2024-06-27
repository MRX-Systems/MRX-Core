import jest from '@/../Templates/jest.json' with { type: 'json' };
import { AndesiteError } from '@/Common/Error/index.js';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CommonErrorKeys, ServiceErrorKeys } from '@/Common/Error/Enum/index.js';
import { File } from '@/Common/Util/index.js';

/**
 * Create a jest.config.json file.
 *
 * @param projectName - The name of the project.
 * @param path - The parent path of the jest.config.json.
 *
 * @throws ({@link AndesiteError}) - If jest.config.json already exists. ({@link ServiceErrorKeys.ERROR_JEST_EXISTS})
 * @throws ({@link AndesiteError}) If the file access is denied. ({@link CommonErrorKeys.ERROR_ACCESS_FILE})
 * @throws ({@link AndesiteError}) If the file write fails. ({@link CommonErrorKeys.ERROR_WRITE_FILE})
 */
function initJestConfig(
    projectName: string,
    path: string = './'
): void {
    const file = new File({ path: `${path}/.andesite/jest.config.json` });
    if (file.exists())
        throw new AndesiteError({
            messageKey: ServiceErrorKeys.ERROR_JEST_EXISTS
        });
    jest.displayName = projectName;
    file.write(JSON.stringify(jest, null, 2));
}

export {
    initJestConfig
};

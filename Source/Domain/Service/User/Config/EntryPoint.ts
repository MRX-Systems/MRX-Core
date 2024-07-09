import { AndesiteError } from '@/Common/Error/index.js';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CommonErrorKeys, ServiceErrorKeys } from '@/Common/Error/Enum/index.js';
import { File } from '@/Common/Util/index.js';

/**
 * Initialize the entry point of the project.
 *
 * @param path - The path where the entry point will be created.
 *
 * @throws ({@link AndesiteError}) - If the entry point already exists. ({@link ServiceErrorKeys.ERROR_ENTRY_POINT_EXISTS})
 * @throws ({@link AndesiteError}) If the file access is denied. ({@link CommonErrorKeys.ERROR_ACCESS_FILE})
 * @throws ({@link AndesiteError}) If the file write fails. ({@link CommonErrorKeys.ERROR_WRITE_FILE})
 */
export function initEntryPoint(path: string = './'): void {
    const file = new File(`${path}/Source/App.ts`);
    if (file.exists())
        throw new AndesiteError({
            messageKey: ServiceErrorKeys.ERROR_ENTRY_POINT_EXISTS
        });
    file.write('console.log(\'Hello, World!\');');
}

import { File } from '@basalt-lab/basalt-helper';

import { AndesiteError, ErrorKeys } from '@/Common/Error/index.js';

/**
 * Initialize the entry point of the project.
 *
 * @param path - The path where the entry point will be created.
 *
 * @throws ({@link AndesiteError}) - If the entry point already exists. ({@link ErrorKeys.ENTRY_POINT_EXISTS})
 * @throws ({@link AndesiteError}) If the file access is denied. ({@link ErrorKeys.ERROR_ACCESS_FILE})
 * @throws ({@link AndesiteError}) If the file write fails. ({@link ErrorKeys.ERROR_WRITE_FILE})
 */
export function initEntryPoint(path: string = './'): void {
    const file = new File(`${path}/Source/App.ts`);
    if (file.exists())
        throw new AndesiteError({
            messageKey: ErrorKeys.ENTRY_POINT_EXISTS
        });
    file.write('console.log(\'Hello, World!\');');
}

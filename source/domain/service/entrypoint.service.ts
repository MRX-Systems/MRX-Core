import { File } from '@basalt-lab/basalt-helper';

import { CoreError, ErrorKeys } from '#/common/error/index.js';

/**
 * Initialize the entry point of the project.
 *
 * @param path - The path where the entry point will be created.
 *
 * @throws ({@link CoreError}) - If the entry point already exists. ({@link ErrorKeys.ENTRY_POINT_EXISTS})
 * @throws ({@link BasaltError}) If the file access is denied. ({@link ErrorKeys.ERROR_ACCESS_FILE})
 * @throws ({@link BasaltError}) If the file write fails. ({@link ErrorKeys.ERROR_WRITE_FILE})
 */
export function initEntryPoint(path: string = './'): void {
    const file = new File(`${path}/source/app.ts`);
    if (file.exists())
        throw new CoreError({
            messageKey: ErrorKeys.ENTRY_POINT_EXISTS
        });
    file.write('console.log(\'Hello, World!\');');
}


import eslint from '@/../Templates/eslint.json';
import { AndesiteError } from '@/Common/Error';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CommonErrorKeys, ServiceErrorKeys } from '@/Common/Error/Enum';
import { File } from '@/Common/Util';

/**
 * Create the .eslintrc file.
 *
 * @param path - The parent path of the .eslintrc.
 *
 * @throws ({@link AndesiteError}) - If the .eslintrc file already exists. ({@link ServiceErrorKeys.ERROR_ESLINT_EXISTS})
 * @throws ({@link AndesiteError}) If the file access is denied. ({@link CommonErrorKeys.ERROR_ACCESS_FILE})
 * @throws ({@link AndesiteError}) If the file write fails. ({@link CommonErrorKeys.ERROR_WRITE_FILE})
 */
function initEslint(path: string = './'): void {
    const file = new File({ path: `${path}/.eslintrc` });
    if (file.exists())
        throw new AndesiteError({
            messageKey: ServiceErrorKeys.ERROR_ESLINT_EXISTS
        });
    file.write(JSON.stringify(eslint, null, 2));
}

export {
    initEslint
};

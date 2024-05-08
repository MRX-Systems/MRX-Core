import {
    existsSync,
    writeFileSync
} from 'fs';

import eslint from '@/../Templates/Eslint.json';
import { AndesiteError } from '@/Common/Error';
import { ServiceErrorKeys } from '@/Common/Error/Enum';

/**
 * Create the .eslintrc file.
 *
 * @param path - The parent path of the .eslintrc.
 * 
 * @throws {@link AndesiteError} - If the .eslintrc file already exists. {@link ServiceErrorKeys.ERROR_ESLINT_EXISTS}
 */
function createEslint(path: string = './example'): void {
    if (existsSync(`${path}/.eslintrc`))
        throw new AndesiteError({
            messageKey: ServiceErrorKeys.ERROR_ESLINT_EXISTS
        });
    writeFileSync(`${path}/.eslintrc`, JSON.stringify(eslint, null, 4));
}

export {
    createEslint
};

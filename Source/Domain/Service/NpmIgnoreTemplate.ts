import {
    existsSync,
    writeFileSync
} from 'fs';

import { AndesiteError } from '@/Common/Error';
import { ServiceErrorKeys } from '@/Common/Error/Enum';

const npmIgnore = `
.eslintrc
.github
.idea
.nvmrc
.vscode
CHANGELOG.md
coverage/
docs/
jest.config.json
Source/
Tests/
tsconfig.json
tsconfig.tsbuildinfo
`;

/**
 * Create the .npmignore file
 * 
 * @param path - The path to create the .npmignore file
 * 
 * @throws {@link AndesiteError} - If the .npmignore file already exists. {@link ServiceErrorKeys.ERROR_NPM_IGNORE_EXISTS}
 */
function initNpmIgnoreFile(path: string = './'): void {
    if (existsSync(`${path}/.npmignore`))
        throw new AndesiteError({
            messageKey: ServiceErrorKeys.ERROR_NPM_IGNORE_EXISTS
        });
    writeFileSync(`${path}/.npmignore`, npmIgnore);
}

export {
    initNpmIgnoreFile
};
